import { SlashCommandBuilder } from "discord.js";
import { successEmbed, errorEmbed } from "../../utils/embed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback and clear the queue"),

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

    queue.tracks.clear();
    queue.node.stop();

    await interaction.reply({
      embeds: [successEmbed("Đã dừng", "Đã dừng phát và xóa hàng đợi.")],
    });
  },
};
