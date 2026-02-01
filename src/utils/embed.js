import { EmbedBuilder } from 'discord.js';
import config from '../../config/config.js';

/**
 * Create a standard embed with consistent styling
 */
function createEmbed(type = 'primary') {
    const embed = new EmbedBuilder()
        .setColor(config.colors[type] || config.colors.primary)
        .setTimestamp()
        .setFooter({ text: 'MeoMeo Bot' });
    
    return embed;
}

/**
 * Success embed (green)
 */
export function successEmbed(title, description) {
    return createEmbed('success')
        .setTitle(`${config.emojis.success} ${title}`)
        .setDescription(description);
}

/**
 * Error embed (red)
 */
export function errorEmbed(title, description) {
    return createEmbed('error')
        .setTitle(`${config.emojis.error} ${title}`)
        .setDescription(description);
}

/**
 * Warning embed (yellow)
 */
export function warningEmbed(title, description) {
    return createEmbed('warning')
        .setTitle(`${config.emojis.warning} ${title}`)
        .setDescription(description);
}

/**
 * Info embed (blue)
 */
export function infoEmbed(title, description) {
    return createEmbed('info')
        .setTitle(title)
        .setDescription(description);
}

/**
 * Custom embed with full control
 */
export function customEmbed(options = {}) {
    const embed = new EmbedBuilder()
        .setTimestamp()
        .setFooter({ text: 'MeoMeo Bot' });
    
    if (options.color) embed.setColor(options.color);
    else embed.setColor(config.colors.primary);
    
    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);
    if (options.author) embed.setAuthor(options.author);
    if (options.fields) embed.addFields(options.fields);
    if (options.footer) embed.setFooter(options.footer);
    
    return embed;
}

/**
 * Progress bar for XP/level
 */
export function createProgressBar(current, max, length = 20) {
    const percentage = Math.min(current / max, 1);
    const filled = Math.floor(percentage * length);
    const empty = length - filled;
    
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    
    return `${filledBar}${emptyBar} ${Math.floor(percentage * 100)}%`;
}

export default {
    success: successEmbed,
    error: errorEmbed,
    warning: warningEmbed,
    info: infoEmbed,
    custom: customEmbed,
    progressBar: createProgressBar
};
