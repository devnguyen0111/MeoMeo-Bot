import { SlashCommandBuilder } from "discord.js";
import {
  errorContainer,
  successContainer,
  v2Payload,
} from "../../utils/componentsV2.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song"),

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

    queue.node.setPaused(true);

    await interaction.reply(
      v2Payload(successContainer("Đã tạm dừng", "Đã tạm dừng phát.")),
    );
  },
};
