import { SlashCommandBuilder } from "discord.js";
import { customEmbed, errorEmbed } from "../../utils/embed.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the currently playing song"),

  async execute(interaction) {
    const queue = interaction.client.player?.nodes.get(interaction.guild.id);

    if (!queue?.currentTrack) {
      await interaction.reply({
        embeds: [
          errorEmbed("Không có bài đang phát", "Không có bài nào đang phát."),
        ],
        ephemeral: true,
      });
      return;
    }

    const track = queue.currentTrack;
    const embed = customEmbed({
      title: "🎶 Đang phát",
      description: `**${track.title}**`,
      color: config.colors.primary,
      thumbnail: track.thumbnail,
      fields: [
        { name: "Thời lượng", value: track.duration, inline: true },
        {
          name: "Yêu cầu bởi",
          value: track.requestedBy?.tag || "Không rõ",
          inline: true,
        },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
