import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

/**
 * Transfer money modal
 */
export function transferModal() {
    const modal = new ModalBuilder()
        .setCustomId('transfer_modal')
        .setTitle('Transfer Money');
    
    const recipientInput = new TextInputBuilder()
        .setCustomId('transfer_recipient')
        .setLabel('Recipient User ID')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter user ID or @mention')
        .setRequired(true);
    
    const amountInput = new TextInputBuilder()
        .setCustomId('transfer_amount')
        .setLabel('Amount')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter amount to transfer')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(10);
    
    const noteInput = new TextInputBuilder()
        .setCustomId('transfer_note')
        .setLabel('Note (Optional)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Add a note to this transfer')
        .setRequired(false)
        .setMaxLength(200);
    
    modal.addComponents(
        new ActionRowBuilder().addComponents(recipientInput),
        new ActionRowBuilder().addComponents(amountInput),
        new ActionRowBuilder().addComponents(noteInput)
    );
    
    return modal;
}

/**
 * Moderation reason modal
 */
export function moderationReasonModal(action = 'Action', customId = 'mod_reason') {
    const modal = new ModalBuilder()
        .setCustomId(customId)
        .setTitle(`${action} Reason`);
    
    const reasonInput = new TextInputBuilder()
        .setCustomId('reason_input')
        .setLabel('Reason')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(`Enter reason for ${action.toLowerCase()}`)
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(500);
    
    modal.addComponents(
        new ActionRowBuilder().addComponents(reasonInput)
    );
    
    return modal;
}

/**
 * Ban modal with reason and duration
 */
export function banModal() {
    const modal = new ModalBuilder()
        .setCustomId('ban_modal')
        .setTitle('Ban Member');
    
    const reasonInput = new TextInputBuilder()
        .setCustomId('ban_reason')
        .setLabel('Ban Reason')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Enter reason for ban')
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(500);
    
    const deleteMessagesInput = new TextInputBuilder()
        .setCustomId('delete_messages_days')
        .setLabel('Delete Messages (days)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('0-7 days (default: 0)')
        .setRequired(false)
        .setValue('0')
        .setMinLength(1)
        .setMaxLength(1);
    
    modal.addComponents(
        new ActionRowBuilder().addComponents(reasonInput),
        new ActionRowBuilder().addComponents(deleteMessagesInput)
    );
    
    return modal;
}

/**
 * Warn modal
 */
export function warnModal() {
    return moderationReasonModal('Warning', 'warn_modal');
}

/**
 * Custom input modal
 */
export function customModal(customId, title, inputs) {
    const modal = new ModalBuilder()
        .setCustomId(customId)
        .setTitle(title);
    
    for (const input of inputs) {
        const textInput = new TextInputBuilder()
            .setCustomId(input.customId)
            .setLabel(input.label)
            .setStyle(input.paragraph ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setRequired(input.required !== false);
        
        if (input.placeholder) textInput.setPlaceholder(input.placeholder);
        if (input.value) textInput.setValue(input.value);
        if (input.minLength) textInput.setMinLength(input.minLength);
        if (input.maxLength) textInput.setMaxLength(input.maxLength);
        
        modal.addComponents(new ActionRowBuilder().addComponents(textInput));
    }
    
    return modal;
}

export default {
    transfer: transferModal,
    moderationReason: moderationReasonModal,
    ban: banModal,
    warn: warnModal,
    custom: customModal
};
