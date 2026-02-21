import { SlashCommandBuilder } from "discord.js";
import { successEmbed, errorEmbed } from "../../utils/embed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the current song"),

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

    queue.node.setPaused(false);

    await interaction.reply({
      embeds: [successEmbed("Đã tiếp tục", "Đã tiếp tục phát.")],
    });
  },
};
