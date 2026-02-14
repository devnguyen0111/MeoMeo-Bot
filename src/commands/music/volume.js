import { SlashCommandBuilder } from "discord.js";
import { successEmbed, errorEmbed } from "../../utils/embed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Change playback volume")
    .addIntegerOption((option) =>
      option
        .setName("level")
        .setDescription("Volume level (1-100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    ),

  async execute(interaction) {
    const level = interaction.options.getInteger("level", true);
    const queue = interaction.client.player?.nodes.get(interaction.guild.id);

    if (!queue?.currentTrack) {
      await interaction.reply({
        embeds: [errorEmbed("Nothing Playing", "There is no song playing.")],
        ephemeral: true,
      });
      return;
    }

    queue.node.setVolume(level);

    await interaction.reply({
      embeds: [successEmbed("Volume Updated", `Volume set to **${level}**.`)],
    });
  },
};
