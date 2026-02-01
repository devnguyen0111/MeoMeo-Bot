import { SlashCommandBuilder } from 'discord.js';
import { customEmbed } from '../../utils/embed.js';
import User from '../../models/User.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('voicetime')
        .setDescription('Check voice time statistics')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to check stats for')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        
        let user = await User.findOne({ userId: targetUser.id });
        if (!user) {
            user = new User({ userId: targetUser.id });
            await user.save();
        }
        
        // Reset daily voice time if needed
        user.resetDailyVoiceTime();
        await user.save();
        
        // Format times
        const totalHours = Math.floor(user.totalVoiceTime / 60);
        const totalMins = user.totalVoiceTime % 60;
        const todayHours = Math.floor(user.voiceTimeToday / 60);
        const todayMins = user.voiceTimeToday % 60;
        
        // Calculate averages (simplified - could be improved with more data)
        const avgPerDay = Math.floor(user.totalVoiceTime / 30); // Rough 30-day average
        const avgHours = Math.floor(avgPerDay / 60);
        const avgMins = avgPerDay % 60;
        
        // Check if currently in voice
        const guild = interaction.guild;
        const member = await guild.members.fetch(targetUser.id);
        const currentlyInVoice = member.voice.channel !== null;
        const currentChannel = currentlyInVoice ? member.voice.channel.name : 'Not in voice';
        
        const embed = customEmbed({
            title: `🎙️ ${targetUser.username}'s Voice Statistics`,
            color: config.colors.primary,
            thumbnail: targetUser.displayAvatarURL({ size: 256 }),
            fields: [
                { name: '📊 Total Voice Time', value: `${totalHours}h ${totalMins}m`, inline: true },
                { name: '📅 Today', value: `${todayHours}h ${todayMins}m`, inline: true },
                { name: '📈 Daily Average', value: `${avgHours}h ${avgMins}m`, inline: true },
                { name: '🎯 Current Status', value: currentlyInVoice ? `✅ In Voice` : '⭕ Not in Voice', inline: true },
                { name: '📢 Channel', value: currentChannel, inline: true },
                { name: '⭐ XP Earned', value: `${user.totalVoiceTime * config.voiceXpPerMinute} XP`, inline: true }
            ],
            footer: { text: `Level ${user.level} • ${user.xp} XP` }
        });
        
        await interaction.reply({ embeds: [embed] });
    }
};
