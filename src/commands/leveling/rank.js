import { SlashCommandBuilder } from "discord.js";
import { customEmbed, createProgressBar } from "../../utils/embed.js";
import User from "../../models/User.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("View your or someone's voice rank")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to check rank for")
        .setRequired(false),
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user") || interaction.user;

    let user = await User.findOne({ userId: targetUser.id });
    if (!user) {
      user = new User({ userId: targetUser.id });
      await user.save();
    }

    // Reset daily voice time if needed
    user.resetDailyVoiceTime();
    await user.save();

    // Calculate XP needed for next level
    const xpNeeded = config.xpFormula(user.level);
    const progressBar = createProgressBar(user.xp, xpNeeded);

    // Format voice time
    const totalHours = Math.floor(user.totalVoiceTime / 60);
    const totalMins = user.totalVoiceTime % 60;
    const todayHours = Math.floor(user.voiceTimeToday / 60);
    const todayMins = user.voiceTimeToday % 60;

    // Get server rank
    const allUsers = await User.find({}).sort({ level: -1, xp: -1 });
    const rank = allUsers.findIndex((u) => u.userId === targetUser.id) + 1;

    const embed = customEmbed({
      title: `${config.emojis.level} Hạng voice của ${targetUser.username}`,
      color: config.colors.primary,
      thumbnail: targetUser.displayAvatarURL({ size: 256 }),
      fields: [
        { name: "🏆 Hạng", value: `#${rank}`, inline: true },
        { name: "📊 Cấp", value: `**${user.level}**`, inline: true },
        { name: "⭐ XP", value: `${user.xp} / ${xpNeeded}`, inline: true },
        { name: "📈 Tiến độ", value: progressBar, inline: false },
        {
          name: "🎙️ Tổng thời gian voice",
          value: `${totalHours}h ${totalMins}m`,
          inline: true,
        },
        {
          name: "📅 Thời gian voice hôm nay",
          value: `${todayHours}h ${todayMins}m`,
          inline: true,
        },
        { name: "\u200b", value: "\u200b", inline: true },
      ],
      footer: { text: `${config.voiceXpPerMinute} XP mỗi phút trong voice` },
    });

    await interaction.reply({ embeds: [embed] });
  },
};
