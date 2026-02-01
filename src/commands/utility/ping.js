import { SlashCommandBuilder } from 'discord.js';
import { infoEmbed } from '../../utils/embed.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and API ping'),
    
    async execute(interaction) {
        const sent = await interaction.reply({
            embeds: [infoEmbed('🏓 Pinging...', 'Calculating latency...')],
            fetchReply: true
        });
        
        const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        
        const embed = infoEmbed('🏓 Pong!', null)
            .addFields(
                { name: '📡 Bot Latency', value: `\`${botLatency}ms\``, inline: true },
                { name: '🌐 API Latency', value: `\`${apiLatency}ms\``, inline: true }
            );
        
        await interaction.editReply({ embeds: [embed] });
    }
};
