import { SlashCommandBuilder } from "discord.js";
import { successEmbed, errorEmbed } from "../../utils/embed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the current queue"),

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

    if (queue.tracks.size < 2) {
      await interaction.reply({
        embeds: [errorEmbed("Chưa đủ bài", "Thêm bài để xáo trộn.")],
        ephemeral: true,
      });
      return;
    }

    queue.tracks.shuffle();

    await interaction.reply({
      embeds: [successEmbed("Đã xáo trộn", "Đã cập nhật thứ tự hàng đợi.")],
    });
  },
};
