import { SlashCommandBuilder } from 'discord.js';
import { customEmbed, successEmbed, errorEmbed } from '../../utils/embed.js';
import selectMenus from '../../components/selectMenus.js';
import buttons from '../../components/buttons.js';
import { awaitSelectMenu, awaitButton } from '../../utils/collectors.js';
import Economy from '../../models/Economy.js';
import config from '../../../config/config.js';

// Shop items database
const shopItems = {
    cosmetics: [
        { id: 'profile_bg_1', name: '🌟 Starry Background', description: 'Starry night profile background', price: 500, emoji: '🌟' },
        { id: 'profile_bg_2', name: '🌊 Ocean Background', description: 'Deep ocean profile background', price: 500, emoji: '🌊' },
        { id: 'badge_1', name: '👑 VIP Badge', description: 'Exclusive VIP badge', price: 1000, emoji: '👑' }
    ],
    boosters: [
        { id: 'xp_boost', name: '⚡ XP Booster', description: '2x XP for 24 hours', price: 800, emoji: '⚡' },
        { id: 'coin_boost', name: '💎 Coin Booster', description: '2x daily rewards for 24 hours', price: 800, emoji: '💎' }
    ],
    items: [
        { id: 'trophy', name: '🏆 Trophy', description: 'A shiny trophy collectible', price: 300, emoji: '🏆' },
        { id: 'gift', name: '🎁 Mystery Gift', description: 'Random reward item', price: 600, emoji: '🎁' }
    ]
};

export default {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Browse and purchase items from the shop'),
    
    async execute(interaction) {
        const mainEmbed = customEmbed({
            title: '🛒 MeoMeo Shop',
            description: 'Welcome to the shop! Select a category to browse items.',
            color: config.colors.primary,
            fields: [
                { name: '🎨 Cosmetics', value: 'Profile customization items', inline: true },
                { name: '🏆 Boosters', value: 'XP and economy boosters', inline: true },
                { name: '🎁 Items', value: 'Collectible items', inline: true }
            ]
        });
        
        const categoryMenu = selectMenus.shopCategory();
        
        const message = await interaction.reply({
            embeds: [mainEmbed],
            components: [categoryMenu],
            fetchReply: true
        });
        
        // Wait for category selection
        const categoryInteraction = await awaitSelectMenu(message, interaction.user.id, 60);
        if (!categoryInteraction) {
            return interaction.editReply({ components: [] });
        }
        
        const category = categoryInteraction.values[0];
        const items = shopItems[category];
        
        // Show items in category
        const itemsMenu = selectMenus.shopItems(items, category);
        
        const categoryEmbed = customEmbed({
            title: `🛒 ${category.charAt(0).toUpperCase() + category.slice(1)} Shop`,
            description: 'Select an item to purchase:',
            color: config.colors.primary,
            fields: items.map(item => ({
                name: `${item.emoji} ${item.name}`,
                value: `${item.description}\n**Price:** ${item.price} 💰`,
                inline: true
            }))
        });
        
        await categoryInteraction.update({
            embeds: [categoryEmbed],
            components: [itemsMenu]
        });
        
        // Wait for item selection
        const itemInteraction = await awaitSelectMenu(message, interaction.user.id, 60);
        if (!itemInteraction) {
            return interaction.editReply({ components: [] });
        }
        
        const [itemCategory, itemId] = itemInteraction.values[0].split('_').slice(0, 2);
        const fullItemId = itemInteraction.values[0];
        const item = shopItems[category].find(i => fullItemId.includes(i.id));
        
        if (!item) {
            return itemInteraction.update({
                embeds: [errorEmbed('Error', 'Item not found.')],
                components: []
            });
        }
        
        // Confirmation
        const confirmEmbed = customEmbed({
            title: '🛍️ Confirm Purchase',
            description: `Are you sure you want to buy this item?`,
            color: config.colors.warning,
            fields: [
                { name: 'Item', value: `${item.emoji} ${item.name}`, inline: true },
                { name: 'Price', value: `${item.price} 💰`, inline: true }
            ]
        });
        
        const confirmButtons = buttons.confirmation('purchase');
        
        await itemInteraction.update({
            embeds: [confirmEmbed],
            components: [confirmButtons]
        });
        
        const buttonInteraction = await awaitButton(message, interaction.user.id, 30);
        
        if (!buttonInteraction || buttonInteraction.customId === 'purchase_no') {
            return buttonInteraction ?
                buttonInteraction.update({ embeds: [errorEmbed('Cancelled', 'Purchase cancelled.')], components: [] }) :
                interaction.editReply({ components: [] });
        }
        
        // Process purchase
        let economy = await Economy.findOne({ userId: interaction.user.id });
        if (!economy) {
            economy = new Economy({ userId: interaction.user.id });
        }
        
        const success = economy.removeBalance(item.price, `Purchased ${item.name}`);
        
        if (!success) {
            return buttonInteraction.update({
                embeds: [errorEmbed('Insufficient Funds', `You need **${item.price}** coins but only have **${economy.balance}** coins.`)],
                components: []
            });
        }
        
        economy.addItem(item.id, item.name, 1);
        await economy.save();
        
        await buttonInteraction.update({
            embeds: [successEmbed(
                'Purchase Successful!',
                `You bought ${item.emoji} **${item.name}** for **${item.price}** coins!\n\nRemaining balance: **${economy.balance}** coins`
            )],
            components: []
        });
    }
};
