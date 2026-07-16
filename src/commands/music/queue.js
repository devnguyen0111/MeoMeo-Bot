import { SlashCommandBuilder } from "discord.js";
import buttons from "../../components/buttons.js";
import {
  cardContainer,
  errorContainer,
  v2Flags,
  v2Payload,
} from "../../utils/componentsV2.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("View the current queue"),

  async execute(interaction) {
    const queue = interaction.client.player?.nodes.get(interaction.guild.id);

    if (!queue?.currentTrack) {
      await interaction.reply(
        v2Payload(
          errorContainer("Hàng đợi trống", "Không có bài nào trong hàng đợi."),
          { ephemeral: true },
        ),
      );
      return;
    }

    const tracks = queue.tracks.toArray();
    const pageSize = 10;
    const totalPages = Math.max(Math.ceil(tracks.length / pageSize), 1);
    let currentPage = 0;

    const buildContainer = (page) => {
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

      return cardContainer({
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
        rows:
          totalPages > 1
            ? [buttons.pagination(page, totalPages, "queue")]
            : [],
      });
    };

    const message = await interaction.reply({
      ...v2Payload(buildContainer(currentPage)),
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

      await buttonInteraction.update(v2Payload(buildContainer(currentPage)));
    });

    collector.on("end", async () => {
      await message
        .edit({
          components: [buildContainer(currentPage)],
          flags: v2Flags(),
        })
        .catch(() => {});
    });
  },
};
