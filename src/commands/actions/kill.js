import { SlashCommandBuilder } from 'discord.js';
import { handleAnimeInteraction } from '../../utils/waifuUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('kill')
        .setDescription('Kill someone (in Minecraft) 🔪')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to kill')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await handleAnimeInteraction(interaction, 'kill', 'hạ gục');
    }
};
