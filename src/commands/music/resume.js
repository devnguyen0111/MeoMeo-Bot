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
        embeds: [errorEmbed("Nothing Playing", "There is no song playing.")],
        ephemeral: true,
      });
      return;
    }

    queue.node.setPaused(false);

    await interaction.reply({
      embeds: [successEmbed("Resumed", "Playback resumed.")],
    });
  },
};
