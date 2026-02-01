import { SlashCommandBuilder } from 'discord.js';
import { handleAnimeInteraction } from '../../utils/waifuUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('Pat someone on the head! 💆')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to pat')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await handleAnimeInteraction(interaction, 'pat', 'patted');
    }
};
