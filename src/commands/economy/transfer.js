import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, errorEmbed, customEmbed } from '../../utils/embed.js';
import Economy from '../../models/Economy.js';
import modals from '../../components/modals.js';
import buttons from '../../components/buttons.js';
import { awaitButton } from '../../utils/collectors.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfer money to another user'),
    
    async execute(interaction) {
        // Show modal for transfer details
        const modal = modals.transfer();
        await interaction.showModal(modal);
        
        // Wait for modal submission
        const submitted = await interaction.awaitModalSubmit({
            filter: (i) => i.customId === 'transfer_modal' && i.user.id === interaction.user.id,
            time: 120000
        }).catch(() => null);
        
        if (!submitted) return;
        
        const recipientInput = submitted.fields.getTextInputValue('transfer_recipient');
        const amountInput = submitted.fields.getTextInputValue('transfer_amount');
        const note = submitted.fields.getTextInputValue('transfer_note') || 'No note';
        
        // Parse amount
        const amount = parseInt(amountInput);
        if (isNaN(amount) || amount <= 0) {
            return submitted.reply({
                embeds: [errorEmbed('Invalid Amount', 'Please enter a valid positive number.')],
                ephemeral: true
            });
        }
        
        // Parse recipient (ID or mention)
        const recipientId = recipientInput.replace(/[<@!>]/g, '');
        
        try {
            const recipient = await interaction.client.users.fetch(recipientId);
            
            if (recipient.id === interaction.user.id) {
                return submitted.reply({
                    embeds: [errorEmbed('Invalid Transfer', 'You cannot transfer money to yourself!')],
                    ephemeral: true
                });
            }
            
            // Get economies
            let senderEconomy = await Economy.findOne({ userId: interaction.user.id });
            if (!senderEconomy) {
                senderEconomy = new Economy({ userId: interaction.user.id });
                await senderEconomy.save();
            }
            
            if (senderEconomy.balance < amount) {
                return submitted.reply({
                    embeds: [errorEmbed('Insufficient Funds', `You don't have enough money. Your balance: **${senderEconomy.balance}** coins`)],
                    ephemeral: true
                });
            }
            
            let recipientEconomy = await Economy.findOne({ userId: recipient.id });
            if (!recipientEconomy) {
                recipientEconomy = new Economy({ userId: recipient.id });
            }
            
            // Confirmation
            const confirmEmbed = customEmbed({
                title: '💸 Confirm Transfer',
                description: 'Please confirm this transaction:',
                color: config.colors.warning,
                fields: [
                    { name: 'To', value: recipient.toString(), inline: true },
                    { name: 'Amount', value: `**${amount}** coins`, inline: true },
                    { name: 'Note', value: note, inline: false }
                ]
            });
            
            const confirmButtons = buttons.confirmation('transfer');
            
            const message = await submitted.reply({
                embeds: [confirmEmbed],
                components: [confirmButtons],
                fetchReply: true,
                ephemeral: true
            });
            
            const buttonInteraction = await awaitButton(message, interaction.user.id, 30);
            
            if (!buttonInteraction || buttonInteraction.customId === 'transfer_no') {
                return buttonInteraction ? 
                    buttonInteraction.update({ embeds: [errorEmbed('Cancelled', 'Transfer cancelled.')], components: [] }) :
                    submitted.editReply({ embeds: [errorEmbed('Timeout', 'Transfer cancelled due to timeout.')], components: [] });
            }
            
            // Perform transfer
            const success = await senderEconomy.transferTo(recipientEconomy, amount, note);
            
            if (!success) {
                return buttonInteraction.update({
                    embeds: [errorEmbed('Transfer Failed', 'Insufficient funds.')],
                    components: []
                });
            }
            
            await senderEconomy.save();
            
            await buttonInteraction.update({
                embeds: [successEmbed(
                    'Transfer Successful',
                    `You transferred **${amount}** coins to ${recipient.tag}!\n**Note:** ${note}\n\nYour new balance: **${senderEconomy.balance}** coins`
                )],
                components: []
            });
            
        } catch (error) {
            // Check if we've already replied (from the confirmation step)
            if (submitted.replied) {
                await submitted.editReply({
                    embeds: [errorEmbed('Error', 'Invalid user ID or user not found.')],
                    components: []
                });
            } else {
                await submitted.reply({
                    embeds: [errorEmbed('Error', 'Invalid user ID or user not found.')],
                    ephemeral: true
                });
            }
        }
    }
};
