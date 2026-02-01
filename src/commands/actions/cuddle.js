import { SlashCommandBuilder } from 'discord.js';
import { handleAnimeInteraction } from '../../utils/waifuUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cuddle')
        .setDescription('Cuddle with someone! 🧸')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to cuddle')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await handleAnimeInteraction(interaction, 'cuddle', 'cuddled with');
    }
};
