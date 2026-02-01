import { SlashCommandBuilder } from 'discord.js';
import { customEmbed } from '../../utils/embed.js';
import Economy from '../../models/Economy.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your or someone\'s balance')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to check balance for')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        
        let economy = await Economy.findOne({ userId: targetUser.id });
        if (!economy) {
            economy = new Economy({ userId: targetUser.id });
            await economy.save();
        }
        
        const embed = customEmbed({
            title: `${config.emojis.coin} ${targetUser.username}'s Balance`,
            color: config.colors.success,
            thumbnail: targetUser.displayAvatarURL(),
            fields: [
                { name: '💰 Wallet', value: `**${economy.balance.toLocaleString()}** coins`, inline: true },
                { name: '🏦 Bank', value: `**${economy.bank.toLocaleString()}** coins`, inline: true },
                { name: '💵 Total', value: `**${(economy.balance + economy.bank).toLocaleString()}** coins`, inline: true }
            ]
        });
        
        if (economy.inventory.length > 0) {
            const items = economy.inventory.slice(0, 5).map(item => 
                `${item.itemName} x${item.quantity}`
            ).join('\n');
            embed.addFields({ name: '🎒 Inventory', value: items + (economy.inventory.length > 5 ? '\n...' : '') });
        }
        
        await interaction.reply({ embeds: [embed] });
    }
};
