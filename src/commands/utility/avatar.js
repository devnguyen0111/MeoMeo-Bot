import { SlashCommandBuilder } from 'discord.js';
import { customEmbed } from '../../utils/embed.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Display user avatar')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get avatar from')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        
        // Get avatar URLs with different sizes
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
        const formats = ['webp', 'png', 'jpg'];
        if (user.avatar && user.avatar.startsWith('a_')) {
            formats.push('gif'); // Add gif for animated avatars
        }
        
        const embed = customEmbed({
            title: `${user.username}'s Avatar`,
            color: config.colors.primary,
            image: avatarURL,
            description: `[Download](${avatarURL})`
        });
        
        // Size buttons
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('256')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`avatar_256_${user.id}`),
                new ButtonBuilder()
                    .setLabel('512')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`avatar_512_${user.id}`),
                new ButtonBuilder()
                    .setLabel('1024')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`avatar_1024_${user.id}`),
                new ButtonBuilder()
                    .setLabel('2048')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`avatar_2048_${user.id}`)
            );
        
        const message = await interaction.reply({
            embeds: [embed],
            components: [row1],
            fetchReply: true
        });
        
        // Handle button clicks
        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith('avatar_'),
            time: 120000
        });
        
        collector.on('collect', async (buttonInteraction) => {
            const size = parseInt(buttonInteraction.customId.split('_')[1]);
            const newURL = user.displayAvatarURL({ dynamic: true, size });
            
            const newEmbed = customEmbed({
                title: `${user.username}'s Avatar (${size}x${size})`,
                color: config.colors.primary,
                image: newURL,
                description: `[Download](${newURL})`
            });
            
            await buttonInteraction.update({ embeds: [newEmbed] });
        });
        
        collector.on('end', () => {
            message.edit({ components: [] }).catch(() => {});
        });
    }
};
