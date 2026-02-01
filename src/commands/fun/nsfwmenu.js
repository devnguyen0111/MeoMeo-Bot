import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { customEmbed, errorEmbed } from '../../utils/embed.js';
import config from '../../../config/config.js';

// Helper function to create menu message
export function createNsfwMenu() {
    const embed = customEmbed({
        title: '🔞 NSFW Image Menu',
        description: 'Click a button below to get a random NSFW image of that type.\n\n**Available Types:**\n' +
            '• Hentai • Neko • Kitsune • Kemonomimi\n' +
            '• Ass • Pussy • Thighs • Boobs\n' +
            '• Paizuri • Anal • Yaoi • Tentacle',
        color: config.colors.error,
        footer: { text: '🔞 NSFW Content • 18+ Only • Click buttons to get images' }
    });
    
    // Create button rows (max 5 buttons per row)
    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('nsfw_hentai')
                .setLabel('Hentai')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('💕'),
            new ButtonBuilder()
                .setCustomId('nsfw_hneko')
                .setLabel('Neko')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('😺'),
            new ButtonBuilder()
                .setCustomId('nsfw_hkitsune')
                .setLabel('Kitsune')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🦊'),
            new ButtonBuilder()
                .setCustomId('nsfw_kemonomimi')
                .setLabel('Kemonomimi')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🐾'),
            new ButtonBuilder()
                .setCustomId('nsfw_4k')
                .setLabel('4K')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('✨')
        );
    
    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('nsfw_ass')
                .setLabel('Ass')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🍑'),
            new ButtonBuilder()
                .setCustomId('nsfw_pussy')
                .setLabel('Pussy')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('💦'),
            new ButtonBuilder()
                .setCustomId('nsfw_hthigh')
                .setLabel('Thighs')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🦵'),
            new ButtonBuilder()
                .setCustomId('nsfw_hboobs')
                .setLabel('Boobs')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🍒'),
            new ButtonBuilder()
                .setCustomId('nsfw_paizuri')
                .setLabel('Paizuri')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('💗')
        );
    
    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('nsfw_hanal')
                .setLabel('Anal')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🍑'),
            new ButtonBuilder()
                .setCustomId('nsfw_yaoi')
                .setLabel('Yaoi')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👨'),
            new ButtonBuilder()
                .setCustomId('nsfw_tentacle')
                .setLabel('Tentacle')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🐙'),
        );
    
    return {
        embeds: [embed],
        components: [row1, row2, row3]
    };
}

export default {
    data: new SlashCommandBuilder()
        .setName('nsfwmenu')
        .setDescription('Create NSFW image menu (NSFW channels only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setNSFW(true),
    
    async execute(interaction) {
        // Check if channel is NSFW
        if (!interaction.channel.nsfw) {
            return interaction.reply({
                embeds: [errorEmbed('NSFW Only', 'This command can only be used in NSFW channels!')],
                ephemeral: true
            });
        }
        
        const menuMessage = createNsfwMenu();
        await interaction.reply(menuMessage);
    }
};
