import { SlashCommandBuilder } from "discord.js";
import { successEmbed, errorEmbed } from "../../utils/embed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song"),

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

    queue.node.setPaused(true);

    await interaction.reply({
      embeds: [successEmbed("Đã tạm dừng", "Đã tạm dừng phát.")],
    });
  },
};
