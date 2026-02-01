import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { customEmbed, successEmbed, errorEmbed } from '../../utils/embed.js';
import buttons from '../../components/buttons.js';
import { awaitButton } from '../../utils/collectors.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for kick')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id);
        
        // Check if user can be kicked
        if (!member.kickable) {
            return interaction.reply({
                embeds: [errorEmbed('Cannot Kick', 'I don\'t have permission to kick this user.')],
                ephemeral: true
            });
        }
        
        // Check role hierarchy
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({
                embeds: [errorEmbed('Cannot Kick', 'You cannot kick this user due to role hierarchy.')],
                ephemeral: true
            });
        }
        
        // Confirmation prompt
        const confirmEmbed = customEmbed({
            title: '⚠️ Confirm Kick',
            description: `Are you sure you want to kick ${target.tag}?`,
            color: config.colors.warning,
            fields: [
                { name: 'User', value: target.toString(), inline: true },
                { name: 'Reason', value: reason, inline: true }
            ],
            thumbnail: target.displayAvatarURL()
        });
        
        const confirmButtons = buttons.confirmation('kick');
        
        const message = await interaction.reply({
            embeds: [confirmEmbed],
            components: [confirmButtons],
            fetchReply: true,
            ephemeral: true
        });
        
        const buttonInteraction = await awaitButton(message, interaction.user.id, 30);
        
        if (!buttonInteraction) {
            return interaction.editReply({
                embeds: [errorEmbed('Timeout', 'Kick cancelled due to timeout.')],
                components: []
            });
        }
        
        if (buttonInteraction.customId === 'kick_no') {
            return buttonInteraction.update({
                embeds: [errorEmbed('Cancelled', 'Kick cancelled.')],
                components: []
            });
        }
        
        // Perform kick
        try {
            await member.kick(reason);
            
            await buttonInteraction.update({
                embeds: [successEmbed(
                    'Member Kicked',
                    `${target.tag} has been kicked from the server.\n**Reason:** ${reason}`
                )],
                components: []
            });
        } catch (error) {
            await buttonInteraction.update({
                embeds: [errorEmbed('Error', 'Failed to kick user: ' + error.message)],
                components: []
            });
        }
    }
};
