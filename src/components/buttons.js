import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

/**
 * Confirmation buttons (Yes/No)
 */
export function confirmationButtons(customIdPrefix = "confirm") {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_yes`)
      .setLabel("✅ Xác nhận")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_no`)
      .setLabel("❌ Hủy")
      .setStyle(ButtonStyle.Danger),
  );
}

/**
 * Pagination buttons (Previous/Next)
 */
export function paginationButtons(
  currentPage,
  totalPages,
  customIdPrefix = "page",
) {
  const row = new ActionRowBuilder();

  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_prev`)
      .setLabel("◀️ Trước")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_home`)
      .setLabel("🏠 Đầu")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_next`)
      .setLabel("Tiếp ▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages - 1),
  );

  return row;
}

/**
 * Single action button
 */
export function actionButton(
  customId,
  label,
  emoji = null,
  style = ButtonStyle.Primary,
) {
  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style);

  if (emoji) button.setEmoji(emoji);

  return new ActionRowBuilder().addComponents(button);
}

/**
 * Multiple action buttons
 */
export function actionButtons(buttons) {
  const row = new ActionRowBuilder();

  for (const btn of buttons) {
    const button = new ButtonBuilder()
      .setCustomId(btn.customId)
      .setLabel(btn.label)
      .setStyle(btn.style || ButtonStyle.Primary);

    if (btn.emoji) button.setEmoji(btn.emoji);
    if (btn.disabled) button.setDisabled(true);

    row.addComponents(button);
  }

  return row;
}

/**
 * Streak claim button
 */
export function streakClaimButton(canClaim = true, userId = null) {
  const customId = userId ? `streak_claim_${userId}` : "streak_claim";

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(canClaim ? "🔥 Nhận streak" : "⏳ Đã nhận")
      .setStyle(canClaim ? ButtonStyle.Success : ButtonStyle.Secondary)
      .setDisabled(!canClaim),
  );
}

/**
 * Refresh button
 */
export function refreshButton(customId = "refresh") {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel("🔄 Làm mới")
      .setStyle(ButtonStyle.Secondary),
  );
}

/**
 * View leaderboard button
 */
export function viewLeaderboardButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("view_leaderboard")
      .setLabel("📊 Xem BXH")
      .setStyle(ButtonStyle.Primary),
  );
}

/**
 * View my rank button
 */
export function viewMyRankButton(userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`view_rank_${userId}`)
      .setLabel("👤 Xem hạng của mình")
      .setStyle(ButtonStyle.Success),
  );
}

export default {
  confirmation: confirmationButtons,
  pagination: paginationButtons,
  action: actionButton,
  actions: actionButtons,
  streakClaim: streakClaimButton,
  refresh: refreshButton,
  viewLeaderboard: viewLeaderboardButton,
  viewMyRank: viewMyRankButton,
};
