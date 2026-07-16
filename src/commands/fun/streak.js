import { SlashCommandBuilder } from "discord.js";
import {
  cardContainer,
  errorContainer,
  v2Payload,
} from "../../utils/componentsV2.js";
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

function getDateKey(date) {
  const offset = getOffsetDate(date);
  const year = offset.getUTCFullYear();
  const month = String(offset.getUTCMonth() + 1).padStart(2, "0");
  const day = String(offset.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  return getDateKey(user.streakLastClaim) !== getDateKey(now);
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

function buildStatusContainer(userId, user, now, canClaim) {
  const description = canClaim
    ? "Bấm nút bên dưới để nhận streak."
    : "Bạn đã nhận hôm nay rồi!\nHãy quay lại vào ngày mai.";

  return cardContainer({
    title: "Minigame Streak",
    description:
      `${description}\n\nStreak: **${user.streakCount || 0}** ngày` +
      `\nSố lần khôi phục còn lại trong tháng: **${getRestoresLeft(user, now)}/${MAX_STREAK_RESTORES}**`,
    color: 0x5865f2,
    rows: [buttons.streakClaim(canClaim, userId)],
  });
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
    const container = buildStatusContainer(userId, user, now, canClaim);

    await interaction.reply(v2Payload(container));
  },
};

export async function handleStreakClaim(interaction) {
  const userId = interaction.user.id;
  const targetUserId = interaction.customId.split("_").slice(2).join("_");

  if (targetUserId && targetUserId !== userId) {
    return interaction.reply(
      v2Payload(
        errorContainer("Không phải cho bạn", "Nút này thuộc về người khác."),
        { ephemeral: true },
      ),
    );
  }

  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({ userId });
  }

  const now = new Date();
  if (!canClaimStreak(user, now)) {
    const container = buildStatusContainer(userId, user, now, false);
    await interaction.update(v2Payload(container));
    return;
  }

  ensureRestoreMonth(user, now);
  const { usedRestore } = applyStreakClaim(user, now);
  user.streakLastClaim = now;
  await user.save();

  const container = cardContainer({
    title: "Đã nhận streak!",
    description:
      `Streak: **${user.streakCount}** ngày` +
      `${usedRestore ? "\n🧩 Đã dùng 1 lượt khôi phục streak." : ""}` +
      `\nSố lần khôi phục còn lại trong tháng: **${getRestoresLeft(user, now)}/${MAX_STREAK_RESTORES}**`,
    color: 0x57f287,
    rows: [buttons.streakClaim(false, userId)],
  });

  await interaction.update(v2Payload(container));
}
