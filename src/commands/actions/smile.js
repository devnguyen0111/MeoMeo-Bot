import { SlashCommandBuilder } from 'discord.js';
import { handleAnimeInteraction } from '../../utils/waifuUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('smile')
        .setDescription('Smile! 😄'),
    
    async execute(interaction) {
        await handleAnimeInteraction(interaction, 'smile', 'đang mỉm cười', false);
    }
};
