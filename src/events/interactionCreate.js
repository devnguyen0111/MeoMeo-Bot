import { Events } from 'discord.js';
import logger from '../utils/logger.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            await handleCommand(interaction);
        }
        
        // Handle button interactions
        else if (interaction.isButton()) {
            // Button interactions are handled within command files
            // using collectors, so we don't need to handle them here
            return;
        }
        
        // Handle select menu interactions
        else if (interaction.isStringSelectMenu()) {
            // Select menu interactions are handled within command files
            // using collectors, so we don't need to handle them here
            return;
        }
        
        // Handle modal submissions
        else if (interaction.isModalSubmit()) {
            // Modal submissions are handled within command files
            // using collectors, so we don't need to handle them here
            return;
        }
    }
};

async function handleCommand(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);
    
    if (!command) {
        logger.warn(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    
    try {
        logger.command(interaction.commandName, interaction.user.tag);
        await command.execute(interaction);
    } catch (error) {
        logger.error(`Error executing ${interaction.commandName}:`, error);
        
        const errorMessage = {
            content: '❌ There was an error while executing this command!',
            ephemeral: true
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
}
