import { ComponentType } from 'discord.js';
import { errorEmbed } from './embed.js';

/**
 * Create a button collector with timeout handling
 */
export async function createButtonCollector(message, userId, timeoutSeconds = 30) {
    const filter = (interaction) => interaction.user.id === userId;
    
    try {
        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter,
            time: timeoutSeconds * 1000
        });
        
        return collector;
    } catch (error) {
        throw new Error('Failed to create button collector: ' + error.message);
    }
}

/**
 * Create a select menu collector with timeout handling
 */
export async function createSelectMenuCollector(message, userId, timeoutSeconds = 30) {
    const filter = (interaction) => interaction.user.id === userId;
    
    try {
        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter,
            time: timeoutSeconds * 1000
        });
        
        return collector;
    } catch (error) {
        throw new Error('Failed to create select menu collector: ' + error.message);
    }
}

/**
 * Wait for a single button interaction
 */
export async function awaitButton(message, userId, timeoutSeconds = 30) {
    const filter = (interaction) => interaction.user.id === userId;
    
    try {
        const interaction = await message.awaitMessageComponent({
            componentType: ComponentType.Button,
            filter,
            time: timeoutSeconds * 1000
        });
        
        return interaction;
    } catch (error) {
        // Timeout or error
        return null;
    }
}

/**
 * Wait for a single select menu interaction
 */
export async function awaitSelectMenu(message, userId, timeoutSeconds = 30) {
    const filter = (interaction) => interaction.user.id === userId;
    
    try {
        const interaction = await message.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            filter,
            time: timeoutSeconds * 1000
        });
        
        return interaction;
    } catch (error) {
        // Timeout or error
        return null;
    }
}

/**
 * Handle component timeout
 */
export async function handleTimeout(message) {
    try {
        await message.edit({
            components: [],
            embeds: [errorEmbed('Timeout', 'This interaction has expired. Please run the command again.')]
        });
    } catch (error) {
        // Message might be deleted, ignore
    }
}

export default {
    createButtonCollector,
    createSelectMenuCollector,
    awaitButton,
    awaitSelectMenu,
    handleTimeout
};
