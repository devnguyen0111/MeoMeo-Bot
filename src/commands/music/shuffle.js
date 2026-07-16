import { SlashCommandBuilder } from "discord.js";
import {
  errorContainer,
  successContainer,
  v2Payload,
} from "../../utils/componentsV2.js";

export default {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the current queue"),

  async execute(interaction) {
    const queue = interaction.client.player?.nodes.get(interaction.guild.id);

    if (!queue?.currentTrack) {
      await interaction.reply(
        v2Payload(
          errorContainer("Không có bài đang phát", "Không có bài nào đang phát."),
          { ephemeral: true },
        ),
      );
      return;
    }

    if (queue.tracks.size < 2) {
      await interaction.reply(
        v2Payload(
          errorContainer("Chưa đủ bài", "Thêm bài để xáo trộn."),
          { ephemeral: true },
        ),
      );
      return;
    }

    queue.tracks.shuffle();

    await interaction.reply(
      v2Payload(successContainer("Đã xáo trộn", "Đã cập nhật thứ tự hàng đợi.")),
    );
  },
};
