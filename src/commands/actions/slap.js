import { SlashCommandBuilder } from 'discord.js';
import { handleAnimeInteraction } from '../../utils/waifuUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('slap')
        .setDescription('Slap someone! 👋')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to slap')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await handleAnimeInteraction(interaction, 'slap', 'tát');
    }
};
