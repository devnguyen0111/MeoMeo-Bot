import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { customEmbed, errorEmbed } from '../../utils/embed.js';
import config from '../../../config/config.js';

const IMAGE_TYPES = [
    'hass', 'hmidriff', 'pgif', '4k', 'hentai', 'holo', 'hneko', 'neko', 
    'hkitsune', 'kemonomimi', 'anal', 'hanal', 'gonewild', 'kanna', 'ass', 
    'pussy', 'thigh', 'hthigh', 'gah', 'coffee', 'food', 'paizuri', 
    'tentacle', 'boobs', 'hboobs', 'yaoi'
];

const API_URL = 'https://nekobot.xyz/api/image';
const API_KEY = '015445535454455354D6';

export default {
    data: new SlashCommandBuilder()
        .setName('nsfw')
        .setDescription('Get NSFW images (NSFW channels only)')
        .setNSFW(true) // Mark as NSFW command
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Image type')
                .setRequired(true)
                .addChoices(
                    { name: 'Hentai', value: 'hentai' },
                    { name: 'Neko', value: 'hneko' },
                    { name: 'Kitsune', value: 'hkitsune' },
                    { name: 'Kemonomimi', value: 'kemonomimi' },
                    { name: 'Ass', value: 'ass' },
                    { name: 'Pussy', value: 'pussy' },
                    { name: 'Thighs', value: 'hthigh' },
                    { name: 'Boobs', value: 'hboobs' },
                    { name: 'Paizuri', value: 'paizuri' },
                    { name: 'Anal', value: 'hanal' },
                    { name: 'Yaoi', value: 'yaoi' },
                    { name: 'Tentacle', value: 'tentacle' },
                    { name: '4K', value: '4k' } 
                )
        ),
    
    async execute(interaction) {
        // Check if channel is NSFW
        if (!interaction.channel.nsfw) {
            return interaction.reply({
                embeds: [errorEmbed('NSFW Only', 'This command can only be used in NSFW channels!')],
                ephemeral: true
            });
        }
        
        await interaction.deferReply();
        
        const type = interaction.options.getString('type');
        
        try {
            // Fetch image from API
            const response = await fetch(`${API_URL}?type=${type}`, {
                headers: {
                    'Authorization': API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            
            if (!data.success || !data.message) {
                throw new Error('Invalid API response');
            }
            
            const embed = customEmbed({
                title: `🔞 ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                image: data.message,
                color: config.colors.error,
                footer: { text: 'NSFW Content • 18+' }
            });
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('NSFW command error:', error);
            await interaction.editReply({
                embeds: [errorEmbed('Error', 'Failed to fetch image. Please try again later.')]
            });
        }
    }
};
