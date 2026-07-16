import { SlashCommandBuilder } from "discord.js";
import { cardContainer, v2Payload } from "../../utils/componentsV2.js";
import User from "../../models/User.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("voicetime")
    .setDescription("Check voice time statistics")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to check stats for")
        .setRequired(false),
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user") || interaction.user;

    let user = await User.findOne({ userId: targetUser.id });
    if (!user) {
      user = new User({ userId: targetUser.id });
      await user.save();
    }

    user.resetDailyVoiceTime();
    await user.save();

    const totalHours = Math.floor(user.totalVoiceTime / 60);
    const totalMins = user.totalVoiceTime % 60;
    const todayHours = Math.floor(user.voiceTimeToday / 60);
    const todayMins = user.voiceTimeToday % 60;

    const avgPerDay = Math.floor(user.totalVoiceTime / 30);
    const avgHours = Math.floor(avgPerDay / 60);
    const avgMins = avgPerDay % 60;

    const guild = interaction.guild;
    const member = await guild.members.fetch(targetUser.id);
    const currentlyInVoice = member.voice.channel !== null;
    const currentChannel = currentlyInVoice
      ? member.voice.channel.name
      : "Không ở voice";

    const container = cardContainer({
      title: `🎙️ Thống kê voice của ${targetUser.username}`,
      color: config.colors.primary,
      thumbnailUrl: targetUser.displayAvatarURL({ size: 256 }),
      fields: [
        {
          name: "📊 Tổng thời gian voice",
          value: `${totalHours}h ${totalMins}m`,
          inline: true,
        },
        {
          name: "📅 Hôm nay",
          value: `${todayHours}h ${todayMins}m`,
          inline: true,
        },
        {
          name: "📈 Trung bình ngày",
          value: `${avgHours}h ${avgMins}m`,
          inline: true,
        },
        {
          name: "🎯 Trạng thái hiện tại",
          value: currentlyInVoice ? "✅ Đang ở voice" : "⭕ Không ở voice",
          inline: true,
        },
        { name: "📢 Kênh", value: currentChannel, inline: true },
        {
          name: "⭐ XP đã nhận",
          value: `${user.totalVoiceTime * config.voiceXpPerMinute} XP`,
          inline: true,
        },
      ],
      footer: `Cấp ${user.level} • ${user.xp} XP`,
    });

    await interaction.reply(v2Payload(container));
  },
};
