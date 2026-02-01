import { SlashCommandBuilder } from 'discord.js';
import { handleAnimeInteraction } from '../../utils/waifuUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Give someone a big hug! 🤗')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to hug')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await handleAnimeInteraction(interaction, 'hug', 'hugged');
    }
};
