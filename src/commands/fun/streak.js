import { SlashCommandBuilder } from "discord.js";
import { infoEmbed, successEmbed, errorEmbed } from "../../utils/embed.js";
import User from "../../models/User.js";
import buttons from "../../components/buttons.js";

const MAX_STREAK_RESTORES = 5;
const TZ_OFFSET_HOURS = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getOffsetDate(date) {
  return new Date(date.getTime() + TZ_OFFSET_HOURS * 60 * 60 * 1000);
}

function getMonthKey(date) {
  const offset = getOffsetDate(date);
  const month = String(offset.getUTCMonth() + 1).padStart(2, "0");
  return `${offset.getUTCFullYear()}-${month}`;
}

function getDayStartMs(date) {
  const offset = getOffsetDate(date);
  return Date.UTC(
    offset.getUTCFullYear(),
    offset.getUTCMonth(),
    offset.getUTCDate(),
  );
}

function getDayDiff(from, to) {
  const diffMs = getDayStartMs(to) - getDayStartMs(from);
  return Math.floor(diffMs / MS_PER_DAY);
}

function getTimeUntilNextDay(now) {
  const offset = getOffsetDate(now);
  const nextDay = new Date(
    Date.UTC(
      offset.getUTCFullYear(),
      offset.getUTCMonth(),
      offset.getUTCDate() + 1,
    ),
  );
  return Math.max(0, nextDay - offset);
}

function formatTimeRemaining(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function ensureRestoreMonth(user, now) {
  const monthKey = getMonthKey(now);
  if (user.streakRestoreMonth !== monthKey) {
    user.streakRestoreMonth = monthKey;
    user.streakRestoresUsed = 0;
  }
}

function getRestoresLeft(user, now) {
  const monthKey = getMonthKey(now);
  const used =
    user.streakRestoreMonth === monthKey ? user.streakRestoresUsed : 0;
  return Math.max(0, MAX_STREAK_RESTORES - used);
}

function canClaimStreak(user, now) {
  if (!user.streakLastClaim) return true;
  return getDayDiff(user.streakLastClaim, now) >= 1;
}

function applyStreakClaim(user, now) {
  if (!user.streakLastClaim) {
    user.streakCount = 1;
    return { usedRestore: false };
  }

  const dayDiff = getDayDiff(user.streakLastClaim, now);
  if (dayDiff === 1) {
    user.streakCount += 1;
    return { usedRestore: false };
  }

  if (dayDiff > 1) {
    if (user.streakRestoresUsed < MAX_STREAK_RESTORES) {
      user.streakRestoresUsed += 1;
      user.streakCount = Math.max(1, user.streakCount + 1);
      return { usedRestore: true };
    }
    user.streakCount = 1;
    return { usedRestore: false };
  }

  return { usedRestore: false };
}

function buildStatusEmbed(user, now, canClaim) {
  const remainingMs = getTimeUntilNextDay(now);
  const description = canClaim
    ? "Click the button below to claim your streak."
    : `You've already claimed today!\nCome back in **${formatTimeRemaining(remainingMs)}**`;

  return infoEmbed(
    "Streak Minigame",
    `${description}\n\nStreak: **${user.streakCount || 0}** day(s)` +
      `\nRestores left this month: **${getRestoresLeft(user, now)}/${MAX_STREAK_RESTORES}**` +
      `\nNext cooldown reset in: **${formatTimeRemaining(remainingMs)}**`,
  );
}

async function scheduleStreakRefresh(message, userId, delayMs) {
  if (delayMs <= 0) return;

  setTimeout(async () => {
    try {
      const user = await User.findOne({ userId });
      if (!user) return;

      const now = new Date();
      const canClaim = canClaimStreak(user, now);
      const embed = buildStatusEmbed(user, now, canClaim);
      const claimButton = buttons.streakClaim(canClaim, userId);

      await message.edit({ embeds: [embed], components: [claimButton] });
    } catch (error) {
      // Ignore if message is deleted or cannot be edited
    }
  }, delayMs);
}

function scheduleStreakCountdown(message, userId) {
  const interval = setInterval(async () => {
    try {
      const user = await User.findOne({ userId });
      if (!user) {
        clearInterval(interval);
        return;
      }

      const now = new Date();
      const canClaim = canClaimStreak(user, now);
      const embed = buildStatusEmbed(user, now, canClaim);
      const claimButton = buttons.streakClaim(canClaim, userId);

      await message.edit({ embeds: [embed], components: [claimButton] });

      if (canClaim) {
        clearInterval(interval);
      }
    } catch (error) {
      clearInterval(interval);
    }
  }, 30 * 1000);
}

export default {
  data: new SlashCommandBuilder()
    .setName("streak")
    .setDescription("Claim your daily streak"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = new Date();

    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId });
      await user.save();
    }

    const canClaim = canClaimStreak(user, now);
    const embed = buildStatusEmbed(user, now, canClaim);
    const claimButton = buttons.streakClaim(canClaim, userId);

    const message = await interaction.reply({
      embeds: [embed],
      components: [claimButton],
      fetchReply: true,
    });

    if (!canClaim) {
      scheduleStreakRefresh(message, userId, getTimeUntilNextDay(now));
      scheduleStreakCountdown(message, userId);
    }
  },
};

export async function handleStreakClaim(interaction) {
  const userId = interaction.user.id;
  const targetUserId = interaction.customId.split("_").slice(2).join("_");

  if (targetUserId && targetUserId !== userId) {
    return interaction.reply({
      embeds: [
        errorEmbed("Not for you", "This button belongs to another user."),
      ],
    });
  }

  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({ userId });
  }

  const now = new Date();
  if (!canClaimStreak(user, now)) {
    const embed = buildStatusEmbed(user, now, false);
    const claimButton = buttons.streakClaim(false, userId);

    const message = await interaction.update({
      embeds: [embed],
      components: [claimButton],
    });

    scheduleStreakRefresh(message, userId, getTimeUntilNextDay(now));
    scheduleStreakCountdown(message, userId);
    return;
  }

  ensureRestoreMonth(user, now);
  const { usedRestore } = applyStreakClaim(user, now);
  user.streakLastClaim = now;
  await user.save();

  const embed = successEmbed(
    "Streak Claimed!",
    `Streak: **${user.streakCount}** day(s)` +
      `${usedRestore ? "\n🧩 Used 1 streak restore." : ""}` +
      `\nRestores left this month: **${getRestoresLeft(user, now)}/${MAX_STREAK_RESTORES}**` +
      `\nNext cooldown reset in: **${formatTimeRemaining(getTimeUntilNextDay(now))}**`,
  );

  const claimButton = buttons.streakClaim(false, userId);
  const message = await interaction.update({
    embeds: [embed],
    components: [claimButton],
  });

  scheduleStreakRefresh(message, userId, getTimeUntilNextDay(now));
  scheduleStreakCountdown(message, userId);
}
