import { SlashCommandBuilder } from "discord.js";
import buttons from "../../components/buttons.js";
import User from "../../models/User.js";
import { cardContainer, v2Flags, v2Payload } from "../../utils/componentsV2.js";
import config from "../../../config/config.js";

const USERS_PER_PAGE = 10;

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View server voice leaderboard"),

  async execute(interaction) {
    const allUsers = await User.find({}).sort({ level: -1, xp: -1 });

    if (allUsers.length === 0) {
      return interaction.reply(
        v2Payload(
          cardContainer({
            title: "🏆 Bảng xếp hạng voice",
            description: "Chưa có ai trong bảng xếp hạng!",
            color: config.colors.primary,
          }),
        ),
      );
    }

    const totalPages = Math.ceil(allUsers.length / USERS_PER_PAGE);
    let currentPage = 0;

    const generateContainer = async (page) => {
      const start = page * USERS_PER_PAGE;
      const end = start + USERS_PER_PAGE;
      const pageUsers = allUsers.slice(start, end);

      let description = "";
      for (let i = 0; i < pageUsers.length; i++) {
        const rank = start + i + 1;
        const userData = pageUsers[i];

        try {
          const user = await interaction.client.users.fetch(userData.userId);
          const hours = Math.floor(userData.totalVoiceTime / 60);
          const mins = userData.totalVoiceTime % 60;

          const medal =
            rank === 1
              ? "🥇"
              : rank === 2
                ? "🥈"
                : rank === 3
                  ? "🥉"
                  : `**${rank}.**`;
          description += `${medal} ${user.tag}\n`;
          description += `└ Cấp ${userData.level} • ${userData.xp} XP • ${hours}h ${mins}m voice\n\n`;
        } catch (error) {
          // User not found, skip
        }
      }

      return cardContainer({
        title: "🏆 Bảng xếp hạng voice",
        description: description || "Không tìm thấy người dùng",
        color: config.colors.primary,
        footer: `Trang ${page + 1} / ${totalPages}`,
        rows:
          totalPages > 1
            ? [buttons.pagination(page, totalPages, "leaderboard")]
            : [],
      });
    };

    const container = await generateContainer(currentPage);

    const message = await interaction.reply({
      ...v2Payload(container),
      fetchReply: true,
    });

    if (totalPages <= 1) return;

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 120000,
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.customId === "leaderboard_prev") {
        currentPage--;
      } else if (buttonInteraction.customId === "leaderboard_next") {
        currentPage++;
      } else if (buttonInteraction.customId === "leaderboard_home") {
        currentPage = 0;
      }

      const newContainer = await generateContainer(currentPage);

      await buttonInteraction.update(v2Payload(newContainer));
    });

    collector.on("end", () => {
      message
        .edit({
          components: [container],
          flags: v2Flags(),
        })
        .catch(() => {});
    });
  },
};
