import { SlashCommandBuilder } from 'discord.js';
import { customEmbed } from '../../utils/embed.js';
import config from '../../../config/config.js';

const SFW_CATEGORIES = [
    'waifu', 'neko', 'shinobu', 'megumin', 'bully', 
    'cuddle', 'cry', 'hug', 'awoo', 'kiss', 
    'lick', 'pat', 'smug', 'bonk', 'yeet', 
    'blush', 'smile', 'wave', 'highfive', 'handhold', 
    'nom', 'bite', 'glomp', 'slap', 'kill'
];

const NSFW_CATEGORIES = [
    'waifu', 'neko', 'trap', 'blowjob'
];

export default {
    data: new SlashCommandBuilder()
        .setName('waifu')
        .setDescription('Get a random anime image')
        .addSubcommand(subcommand =>
            subcommand
                .setName('sfw')
                .setDescription('Get a safe-for-work anime image')
                .addStringOption(option =>
                    option
                        .setName('category')
                        .setDescription('Image category')
                        .setRequired(true)
                        .addChoices(
                            ...SFW_CATEGORIES.map(c => ({ name: c.charAt(0).toUpperCase() + c.slice(1), value: c }))
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('nsfw')
                .setDescription('Get a NSFW anime image (NSFW channels only)')
                .addStringOption(option =>
                    option
                        .setName('category')
                        .setDescription('Image category')
                        .setRequired(true)
                        .addChoices(
                            ...NSFW_CATEGORIES.map(c => ({ name: c.charAt(0).toUpperCase() + c.slice(1), value: c }))
                        )
                )
        ),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const type = interaction.options.getSubcommand();
        const category = interaction.options.getString('category');
        
        // Validation for NSFW
        if (type === 'nsfw' && !interaction.channel.nsfw) {
            return interaction.editReply({
                embeds: [customEmbed({
                    title: '❌ NSFW Only',
                    description: 'This command can only be used in NSFW channels!',
                    color: config.colors.error
                })]
            });
        }
        
        try {
            const response = await fetch(`https://api.waifu.pics/${type}/${category}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            const embed = customEmbed({
                title: `${type === 'nsfw' ? '🔞 ' : ''}${category.charAt(0).toUpperCase() + category.slice(1)}`,
                image: data.url,
                color: config.colors.primary,
                footer: { text: `Powered by waifu.pics • ${type.toUpperCase()}` }
            });
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Waifu command error:', error);
            await interaction.editReply({
                embeds: [customEmbed({
                    title: '❌ Error',
                    description: 'Failed to fetch image. Please check the category or try again later.',
                    color: config.colors.error
                })]
            });
        }
    }
};
