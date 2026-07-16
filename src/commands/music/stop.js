import { SlashCommandBuilder } from "discord.js";
import {
  errorContainer,
  successContainer,
  v2Payload,
} from "../../utils/componentsV2.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback and clear the queue"),

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

    queue.delete();

    await interaction.reply(
      v2Payload(
        successContainer("Đã dừng", "Đã dừng phát và xóa hàng đợi."),
      ),
    );
  },
};
