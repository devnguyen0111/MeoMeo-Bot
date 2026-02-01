import { SlashCommandBuilder } from 'discord.js';
import { customEmbed } from '../../utils/embed.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display server information'),
    
    async execute(interaction) {
        const { guild } = interaction;
        
        // Get various channel counts
        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;
        
        // Get member statistics
        const members = guild.memberCount;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const humans = members - bots;
        
        const embed = customEmbed({
            title: `${guild.name}`,
            thumbnail: guild.iconURL({ dynamic: true, size: 256 }),
            color: config.colors.primary,
            fields: [
                { name: '📝 Server ID', value: `\`${guild.id}\``, inline: true },
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '\u200b', value: '\u200b', inline: false },
                { name: '👥 Members', value: `${members} total\n${humans} humans\n${bots} bots`, inline: true },
                { name: '📢 Channels', value: `${textChannels} Text\n${voiceChannels} Voice\n${categories} Categories`, inline: true },
                { name: '🎭 Roles', value: `${guild.roles.cache.size} roles`, inline: true },
                { name: '\u200b', value: '\u200b', inline: false },
                { name: '😊 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🚀 Boosts', value: `Level ${guild.premiumTier}\n${guild.premiumSubscriptionCount || 0} boosts`, inline: true },
                { name: '📜 Verification', value: guild.verificationLevel.toString(), inline: true }
            ]
        });
        
        if (guild.description) {
            embed.setDescription(guild.description);
        }
        
        await interaction.reply({ embeds: [embed] });
    }
};
