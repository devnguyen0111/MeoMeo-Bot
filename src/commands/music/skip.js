import { SlashCommandBuilder } from "discord.js";
import {
  errorContainer,
  successContainer,
  v2Payload,
} from "../../utils/componentsV2.js";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of songs to skip")
        .setMinValue(1)
        .setMaxValue(10),
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount") || 1;
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

    const remaining = queue.tracks.size + 1;
    if (amount > remaining) {
      await interaction.reply(
        v2Payload(
          errorContainer("Chưa đủ bài", `Chỉ có **${remaining}** bài để bỏ qua.`),
          { ephemeral: true },
        ),
      );
      return;
    }

    for (let i = 0; i < amount; i += 1) {
      await queue.node.skip();
    }

    await interaction.reply(
      v2Payload(successContainer("Đã bỏ qua", `Đã bỏ qua **${amount}** bài.`)),
    );
  },
};
