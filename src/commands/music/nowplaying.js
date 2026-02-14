import { SlashCommandBuilder } from "discord.js";
import { customEmbed, errorEmbed } from "../../utils/embed.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the currently playing song"),

  async execute(interaction) {
    const queue = interaction.client.player?.nodes.get(interaction.guild.id);

    if (!queue?.currentTrack) {
      await interaction.reply({
        embeds: [errorEmbed("Nothing Playing", "There is no song playing.")],
        ephemeral: true,
      });
      return;
    }

    const track = queue.currentTrack;
    const embed = customEmbed({
      title: "🎶 Now Playing",
      description: `**${track.title}**`,
      color: config.colors.primary,
      thumbnail: track.thumbnail,
      fields: [
        { name: "Duration", value: track.duration, inline: true },
        {
          name: "Requested By",
          value: track.requestedBy?.tag || "Unknown",
          inline: true,
        },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
