import { SlashCommandBuilder } from "discord.js";
import { successEmbed, errorEmbed } from "../../utils/embed.js";

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
      await interaction.reply({
        embeds: [
          errorEmbed("Không có bài đang phát", "Không có bài nào đang phát."),
        ],
        ephemeral: true,
      });
      return;
    }

    const remaining = queue.tracks.size + 1;
    if (amount > remaining) {
      await interaction.reply({
        embeds: [
          errorEmbed("Chưa đủ bài", `Chỉ có **${remaining}** bài để bỏ qua.`),
        ],
        ephemeral: true,
      });
      return;
    }

    for (let i = 0; i < amount; i += 1) {
      await queue.node.skip();
    }

    await interaction.reply({
      embeds: [successEmbed("Đã bỏ qua", `Đã bỏ qua **${amount}** bài.`)],
    });
  },
};
