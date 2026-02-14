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
        embeds: [errorEmbed("Nothing Playing", "There is no song playing.")],
        ephemeral: true,
      });
      return;
    }

    const remaining = queue.tracks.size + 1;
    if (amount > remaining) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            "Not Enough Songs",
            `Only **${remaining}** song(s) are available to skip.`,
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    for (let i = 0; i < amount; i += 1) {
      await queue.node.skip();
    }

    await interaction.reply({
      embeds: [successEmbed("Skipped", `Skipped **${amount}** song(s).`)],
    });
  },
};
