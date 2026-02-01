import { SlashCommandBuilder } from 'discord.js';
import { handleAnimeInteraction } from '../../utils/waifuUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('poke')
        .setDescription('Poke someone! 👉')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to poke')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await handleAnimeInteraction(interaction, 'poke', 'poked');
    }
};
