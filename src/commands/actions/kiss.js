import { SlashCommandBuilder } from 'discord.js';
import { handleAnimeInteraction } from '../../utils/waifuUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Kiss someone! 😘')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to kiss')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await handleAnimeInteraction(interaction, 'kiss', 'hôn');
    }
};
