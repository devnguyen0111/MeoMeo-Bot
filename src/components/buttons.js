import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

/**
 * Confirmation buttons (Yes/No)
 */
export function confirmationButtons(customIdPrefix = "confirm") {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_yes`)
      .setLabel("✅ Confirm")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_no`)
      .setLabel("❌ Cancel")
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
      .setLabel("◀️ Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_home`)
      .setLabel("🏠 Home")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_next`)
      .setLabel("Next ▶️")
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
 * Daily claim button with countdown
 */
export function dailyClaimButton(canClaim = true, userId = null) {
  const customId = userId ? `daily_claim_${userId}` : "daily_claim";

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(canClaim ? "💰 Claim Daily Reward" : "⏳ Already Claimed")
      .setStyle(canClaim ? ButtonStyle.Success : ButtonStyle.Secondary)
      .setDisabled(!canClaim),
  );
}

/**
 * Streak claim button
 */
export function streakClaimButton(canClaim = true, userId = null) {
  const customId = userId ? `streak_claim_${userId}` : "streak_claim";

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(canClaim ? "🔥 Claim Streak" : "⏳ Already Claimed")
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
      .setLabel("🔄 Refresh")
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
      .setLabel("📊 View Leaderboard")
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
      .setLabel("👤 View My Rank")
      .setStyle(ButtonStyle.Success),
  );
}

export default {
  confirmation: confirmationButtons,
  pagination: paginationButtons,
  action: actionButton,
  actions: actionButtons,
  dailyClaim: dailyClaimButton,
  streakClaim: streakClaimButton,
  refresh: refreshButton,
  viewLeaderboard: viewLeaderboardButton,
  viewMyRank: viewMyRankButton,
};
