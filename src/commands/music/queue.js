import { SlashCommandBuilder } from "discord.js";
import { customEmbed, errorEmbed } from "../../utils/embed.js";
import buttons from "../../components/buttons.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("View the current queue"),

  async execute(interaction) {
    const queue = interaction.client.player?.nodes.get(interaction.guild.id);

    if (!queue?.currentTrack) {
      await interaction.reply({
        embeds: [
          errorEmbed("Hàng đợi trống", "Không có bài nào trong hàng đợi."),
        ],
        ephemeral: true,
      });
      return;
    }

    const tracks = queue.tracks.toArray();
    const pageSize = 10;
    const totalPages = Math.max(Math.ceil(tracks.length / pageSize), 1);
    let currentPage = 0;

    const buildEmbed = (page) => {
      const start = page * pageSize;
      const pageTracks = tracks.slice(start, start + pageSize);
      const description = pageTracks.length
        ? pageTracks
            .map(
              (track, index) =>
                `**${start + index + 1}.** ${track.title} (${track.duration})`,
            )
            .join("\n")
        : "Không còn bài nào trong hàng đợi.";

      return customEmbed({
        title: "🎵 Hàng đợi hiện tại",
        description,
        color: config.colors.primary,
        fields: [
          {
            name: "Đang phát",
            value: `${queue.currentTrack.title} (${queue.currentTrack.duration})`,
          },
          {
            name: "Thông tin hàng đợi",
            value: `Bài: **${tracks.length}** | Trang **${page + 1}**/**${totalPages}**`,
          },
        ],
      });
    };

    const components =
      totalPages > 1
        ? [buttons.pagination(currentPage, totalPages, "queue")]
        : [];

    const message = await interaction.reply({
      embeds: [buildEmbed(currentPage)],
      components,
      fetchReply: true,
    });

    if (totalPages <= 1) {
      return;
    }

    const collector = message.createMessageComponentCollector({
      filter: (buttonInteraction) =>
        buttonInteraction.user.id === interaction.user.id,
      time: 60000,
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.customId === "queue_prev") {
        currentPage = Math.max(currentPage - 1, 0);
      } else if (buttonInteraction.customId === "queue_next") {
        currentPage = Math.min(currentPage + 1, totalPages - 1);
      } else if (buttonInteraction.customId === "queue_home") {
        currentPage = 0;
      }

      await buttonInteraction.update({
        embeds: [buildEmbed(currentPage)],
        components: [buttons.pagination(currentPage, totalPages, "queue")],
      });
    });

    collector.on("end", async () => {
      await message.edit({ components: [] }).catch(() => {});
    });
  },
};
