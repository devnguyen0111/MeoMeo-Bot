import { SlashCommandBuilder } from 'discord.js';
import { customEmbed } from '../../utils/embed.js';
import buttons from '../../components/buttons.js';
import { awaitButton } from '../../utils/collectors.js';
import User from '../../models/User.js';
import config from '../../../config/config.js';

const USERS_PER_PAGE = 10;

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View server voice leaderboard'),
    
    async execute(interaction) {
        const allUsers = await User.find({}).sort({ level: -1, xp: -1 });
        
        if (allUsers.length === 0) {
            return interaction.reply('No users in the leaderboard yet!');
        }
        
        const totalPages = Math.ceil(allUsers.length / USERS_PER_PAGE);
        let currentPage = 0;
        
        const generateEmbed = async (page) => {
            const start = page * USERS_PER_PAGE;
            const end = start + USERS_PER_PAGE;
            const pageUsers = allUsers.slice(start, end);
            
            let description = '';
            for (let i = 0; i < pageUsers.length; i++) {
                const rank = start + i + 1;
                const userData = pageUsers[i];
                
                try {
                    const user = await interaction.client.users.fetch(userData.userId);
                    const hours = Math.floor(userData.totalVoiceTime / 60);
                    const mins = userData.totalVoiceTime % 60;
                    
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `**${rank}.**`;
                    description += `${medal} ${user.tag}\n`;
                    description += `└ Level ${userData.level} • ${userData.xp} XP • ${hours}h ${mins}m voice\n\n`;
                } catch (error) {
                    // User not found, skip
                }
            }
            
            return customEmbed({
                title: '🏆 Voice Leaderboard',
                description: description || 'No users found',
                color: config.colors.primary,
                footer: { text: `Page ${page + 1} of ${totalPages}` }
            });
        };
        
        const embed = await generateEmbed(currentPage);
        const navButtons = buttons.pagination(currentPage, totalPages, 'leaderboard');
        
        const message = await interaction.reply({
            embeds: [embed],
            components: totalPages > 1 ? [navButtons] : [],
            fetchReply: true
        });
        
        if (totalPages <= 1) return;
        
        // Handle pagination
        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 120000
        });
        
        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === 'leaderboard_prev') {
                currentPage--;
            } else if (buttonInteraction.customId === 'leaderboard_next') {
                currentPage++;
            } else if (buttonInteraction.customId === 'leaderboard_home') {
                currentPage = 0;
            }
            
            const newEmbed = await generateEmbed(currentPage);
            const newButtons = buttons.pagination(currentPage, totalPages, 'leaderboard');
            
            await buttonInteraction.update({
                embeds: [newEmbed],
                components: [newButtons]
            });
        });
        
        collector.on('end', () => {
            message.edit({ components: [] }).catch(() => {});
        });
    }
};
