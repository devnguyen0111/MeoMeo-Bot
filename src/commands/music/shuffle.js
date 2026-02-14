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
        embeds: [errorEmbed("Nothing Playing", "There is no song playing.")],
        ephemeral: true,
      });
      return;
    }

    if (queue.tracks.size < 2) {
      await interaction.reply({
        embeds: [errorEmbed("Not Enough Songs", "Add more songs to shuffle.")],
        ephemeral: true,
      });
      return;
    }

    queue.tracks.shuffle();

    await interaction.reply({
      embeds: [successEmbed("Queue Shuffled", "Queue order updated.")],
    });
  },
};
