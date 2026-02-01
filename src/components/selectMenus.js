import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

/**
 * Help command category selector
 */
export function helpCategoryMenu() {
    const options = [
        new StringSelectMenuOptionBuilder()
            .setLabel('🛡️ Moderation')
            .setDescription('Server moderation commands')
            .setValue('moderation'),
        new StringSelectMenuOptionBuilder()
            .setLabel('💰 Economy')
            .setDescription('Economy and currency commands')
            .setValue('economy'),
        new StringSelectMenuOptionBuilder()
            .setLabel('📊 Leveling')
            .setDescription('Voice leveling and ranking commands')
            .setValue('leveling'),
        new StringSelectMenuOptionBuilder()
            .setLabel('🎮 Fun')
            .setDescription('Fun and entertainment commands')
            .setValue('fun'),
        new StringSelectMenuOptionBuilder()
            .setLabel('🔧 Utility')
            .setDescription('Utility and information commands')
            .setValue('utility')
    ];
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_category')
        .setPlaceholder('Select a category to view commands')
        .addOptions(options);
    
    return new ActionRowBuilder().addComponents(selectMenu);
}

/**
 * Shop category selector
 */
export function shopCategoryMenu() {
    const options = [
        new StringSelectMenuOptionBuilder()
            .setLabel('🎨 Cosmetics')
            .setDescription('Profile customization items')
            .setValue('cosmetics'),
        new StringSelectMenuOptionBuilder()
            .setLabel('🏆 Boosters')
            .setDescription('XP and economy boosters')
            .setValue('boosters'),
        new StringSelectMenuOptionBuilder()
            .setLabel('🎁 Items')
            .setDescription('Collectible items')
            .setValue('items')
    ];
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_category')
        .setPlaceholder('Select a shop category')
        .addOptions(options);
    
    return new ActionRowBuilder().addComponents(selectMenu);
}

/**
 * Shop items selector
 */
export function shopItemsMenu(items, category) {
    const options = items.map(item => 
        new StringSelectMenuOptionBuilder()
            .setLabel(item.name)
            .setDescription(`${item.price} 💰 - ${item.description}`)
            .setValue(`${category}_${item.id}`)
            .setEmoji(item.emoji || '📦')
    );
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_item')
        .setPlaceholder('Select an item to purchase')
        .addOptions(options);
    
    return new ActionRowBuilder().addComponents(selectMenu);
}

/**
 * Generic select menu builder
 */
export function customSelectMenu(customId, placeholder, options) {
    const menuOptions = options.map(opt => {
        const option = new StringSelectMenuOptionBuilder()
            .setLabel(opt.label)
            .setValue(opt.value);
        
        if (opt.description) option.setDescription(opt.description);
        if (opt.emoji) option.setEmoji(opt.emoji);
        if (opt.default) option.setDefault(true);
        
        return option;
    });
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder(placeholder)
        .addOptions(menuOptions);
    
    return new ActionRowBuilder().addComponents(selectMenu);
}

/**
 * Time duration selector
 */
export function timeDurationMenu(customId = 'time_duration') {
    const options = [
        new StringSelectMenuOptionBuilder()
            .setLabel('1 minute')
            .setValue('60'),
        new StringSelectMenuOptionBuilder()
            .setLabel('5 minutes')
            .setValue('300'),
        new StringSelectMenuOptionBuilder()
            .setLabel('10 minutes')
            .setValue('600'),
        new StringSelectMenuOptionBuilder()
            .setLabel('30 minutes')
            .setValue('1800'),
        new StringSelectMenuOptionBuilder()
            .setLabel('1 hour')
            .setValue('3600'),
        new StringSelectMenuOptionBuilder()
            .setLabel('1 day')
            .setValue('86400')
    ];
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder('Select timeout duration')
        .addOptions(options);
    
    return new ActionRowBuilder().addComponents(selectMenu);
}

export default {
    helpCategory: helpCategoryMenu,
    shopCategory: shopCategoryMenu,
    shopItems: shopItemsMenu,
    custom: customSelectMenu,
    timeDuration: timeDurationMenu
};
