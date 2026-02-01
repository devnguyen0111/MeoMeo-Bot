import { SlashCommandBuilder } from 'discord.js';
import { customEmbed } from '../../utils/embed.js';
import User from '../../models/User.js';
import Economy from '../../models/Economy.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display user information')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id);
        
        // Get user data from database
        let userData = await User.findOne({ userId: targetUser.id });
        let economyData = await Economy.findOne({ userId: targetUser.id });
        
        const embed = customEmbed({
            title: `${targetUser.tag}`,
            thumbnail: targetUser.displayAvatarURL({ dynamic: true, size: 256 }),
            color: member.displayColor || config.colors.primary,
            fields: [
                { name: '🆔 User ID', value: `\`${targetUser.id}\``, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '\u200b', value: '\u200b', inline: false }
            ]
        });
        
        // Add roles
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10);
        
        if (roles.length > 0) {
            embed.addFields({
                name: `🎭 Roles [${member.roles.cache.size - 1}]`,
                value: roles.join(', ') + (member.roles.cache.size > 11 ? '...' : '')
            });
        }
        
        // Add bot stats
        if (userData || economyData) {
            const statsFields = [];
            
            if (userData) {
                statsFields.push({
                    name: '📊 Level & XP',
                    value: `Level: **${userData.level}**\nXP: **${userData.xp}**`,
                    inline: true
                });
                
                const hours = Math.floor(userData.totalVoiceTime / 60);
                const mins = userData.totalVoiceTime % 60;
                statsFields.push({
                    name: '🎙️ Voice Time',
                    value: `${hours}h ${mins}m`,
                    inline: true
                });
            }
            
            if (economyData) {
                statsFields.push({
                    name: '💰 Balance',
                    value: `**${economyData.balance}** coins`,
                    inline: true
                });
            }
            
            if (statsFields.length > 0) {
                embed.addFields({ name: '\u200b', value: '\u200b', inline: false });
                embed.addFields(statsFields);
            }
        }
        
        await interaction.reply({ embeds: [embed] });
    }
};
