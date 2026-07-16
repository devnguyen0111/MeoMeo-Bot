import { SlashCommandBuilder } from "discord.js";
import { cardContainer, v2Payload } from "../../utils/componentsV2.js";
import User from "../../models/User.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Display user information")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get information about")
        .setRequired(false),
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id);
    const userData = await User.findOne({ userId: targetUser.id });

    const fields = [
      {
        name: "🆔 ID người dùng",
        value: `\`${targetUser.id}\``,
        inline: true,
      },
      {
        name: "📅 Ngày tạo tài khoản",
        value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`,
        inline: true,
      },
      {
        name: "📥 Ngày vào máy chủ",
        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
        inline: true,
      },
    ];

    const roles = member.roles.cache
      .filter((role) => role.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map((role) => role.toString())
      .slice(0, 10);

    if (roles.length > 0) {
      fields.push({
        name: `🎭 Vai trò [${member.roles.cache.size - 1}]`,
        value: roles.join(", ") + (member.roles.cache.size > 11 ? "..." : ""),
      });
    }

    if (userData) {
      const hours = Math.floor(userData.totalVoiceTime / 60);
      const mins = userData.totalVoiceTime % 60;
      fields.push(
        {
          name: "📊 Cấp & XP",
          value: `Cấp: **${userData.level}**\nXP: **${userData.xp}**`,
          inline: true,
        },
        {
          name: "🎙️ Thời gian voice",
          value: `${hours}h ${mins}m`,
          inline: true,
        },
      );
    }

    const container = cardContainer({
      title: targetUser.tag,
      color: member.displayColor || config.colors.primary,
      thumbnailUrl: targetUser.displayAvatarURL({ dynamic: true, size: 256 }),
      fields,
    });

    await interaction.reply(v2Payload(container));
  },
};
