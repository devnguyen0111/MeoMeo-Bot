import { SlashCommandBuilder } from 'discord.js';
import { handleAnimeInteraction } from '../../utils/waifuUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cry')
        .setDescription('Cry... 😢'),
    
    async execute(interaction) {
        await handleAnimeInteraction(interaction, 'cry', 'is crying', false);
    }
};
