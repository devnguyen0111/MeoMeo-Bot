import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

/**
 * Moderation reason modal
 */
export function moderationReasonModal(
  action = "Action",
  customId = "mod_reason",
) {
  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle(`Lý do ${action}`);

  const reasonInput = new TextInputBuilder()
    .setCustomId("reason_input")
    .setLabel("Lý do")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(`Nhập lý do cho ${action.toLowerCase()}`)
    .setRequired(true)
    .setMinLength(3)
    .setMaxLength(500);

  modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

  return modal;
}

/**
 * Ban modal with reason and duration
 */
export function banModal() {
  const modal = new ModalBuilder()
    .setCustomId("ban_modal")
    .setTitle("Cấm thành viên");

  const reasonInput = new TextInputBuilder()
    .setCustomId("ban_reason")
    .setLabel("Lý do cấm")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Nhập lý do cấm")
    .setRequired(true)
    .setMinLength(3)
    .setMaxLength(500);

  const deleteMessagesInput = new TextInputBuilder()
    .setCustomId("delete_messages_days")
    .setLabel("Xóa tin nhắn (ngày)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("0-7 ngày (mặc định: 0)")
    .setRequired(false)
    .setValue("0")
    .setMinLength(1)
    .setMaxLength(1);

  modal.addComponents(
    new ActionRowBuilder().addComponents(reasonInput),
    new ActionRowBuilder().addComponents(deleteMessagesInput),
  );

  return modal;
}

/**
 * Warn modal
 */
export function warnModal() {
  return moderationReasonModal("Cảnh cáo", "warn_modal");
}

/**
 * Custom input modal
 */
export function customModal(customId, title, inputs) {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title);

  for (const input of inputs) {
    const textInput = new TextInputBuilder()
      .setCustomId(input.customId)
      .setLabel(input.label)
      .setStyle(
        input.paragraph ? TextInputStyle.Paragraph : TextInputStyle.Short,
      )
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
  moderationReason: moderationReasonModal,
  ban: banModal,
  warn: warnModal,
  custom: customModal,
};
