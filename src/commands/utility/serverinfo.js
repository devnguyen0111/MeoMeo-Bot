import { SlashCommandBuilder } from "discord.js";
import { cardContainer, v2Payload } from "../../utils/componentsV2.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Display server information"),

  async execute(interaction) {
    const { guild } = interaction;

    const textChannels = guild.channels.cache.filter((c) => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter((c) => c.type === 2).size;
    const categories = guild.channels.cache.filter((c) => c.type === 4).size;

    const members = guild.memberCount;
    const bots = guild.members.cache.filter((m) => m.user.bot).size;
    const humans = members - bots;

    const container = cardContainer({
      title: guild.name,
      description: guild.description || undefined,
      color: config.colors.primary,
      thumbnailUrl: guild.iconURL({ dynamic: true, size: 256 }),
      fields: [
        { name: "📝 ID máy chủ", value: `\`${guild.id}\``, inline: true },
        { name: "👑 Chủ sở hữu", value: `<@${guild.ownerId}>`, inline: true },
        {
          name: "📅 Ngày tạo",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "👥 Thành viên",
          value: `${members} tổng\n${humans} người\n${bots} bot`,
          inline: true,
        },
        {
          name: "📢 Kênh",
          value: `${textChannels} Text\n${voiceChannels} Voice\n${categories} Danh mục`,
          inline: true,
        },
        {
          name: "🎭 Vai trò",
          value: `${guild.roles.cache.size} vai trò`,
          inline: true,
        },
        { name: "😊 Emoji", value: `${guild.emojis.cache.size}`, inline: true },
        {
          name: "🚀 Boost",
          value: `Cấp ${guild.premiumTier}\n${guild.premiumSubscriptionCount || 0} boost`,
          inline: true,
        },
        {
          name: "📜 Mức xác minh",
          value: guild.verificationLevel.toString(),
          inline: true,
        },
      ],
    });

    await interaction.reply(v2Payload(container));
  },
};
