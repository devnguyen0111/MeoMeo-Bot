import { SlashCommandBuilder } from 'discord.js';
import { customEmbed } from '../../utils/embed.js';
import buttons from '../../components/buttons.js';
import { awaitButton } from '../../utils/collectors.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme'),
    
    async execute(interaction) {
        await showMeme(interaction);
    }
};

async function showMeme(interaction, isUpdate = false) {
    try {
        // Fetch meme from API
        const response = await fetch('https://meme-api.com/gimme');
        const data = await response.json();
        
        const embed = customEmbed({
            title: data.title,
            color: config.colors.primary,
            image: data.url,
            footer: { text: `r/${data.subreddit} • 👍 ${data.ups}` }
        });
        
        const memeButtons = buttons.actions([
            { customId: 'meme_next', label: 'Next Meme', emoji: '🔄', style: 1 },
            { customId: 'meme_upvote', label: data.ups.toString(), emoji: '⭐', style: 2 }
        ]);
        
        if (isUpdate) {
            await interaction.update({
                embeds: [embed],
                components: [memeButtons]
            });
        } else {
            const message = await interaction.reply({
                embeds: [embed],
                components: [memeButtons],
                fetchReply: true
            });
            
            // Handle button interactions
            const collector = message.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 120000
            });
            
            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === 'meme_next') {
                    await showMeme(buttonInteraction, true);
                }
            });
            
            collector.on('end', () => {
                message.edit({ components: [] }).catch(() => {});
            });
        }
    } catch (error) {
        const errorMsg = { embeds: [customEmbed({
            title: '❌ Error',
            description: 'Failed to fetch meme. Please try again!',
            color: config.colors.error
        })], components: [] };
        
        if (isUpdate) {
            await interaction.update(errorMsg);
        } else {
            await interaction.reply(errorMsg);
        }
    }
}
