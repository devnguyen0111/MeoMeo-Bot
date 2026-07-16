import { SlashCommandBuilder } from "discord.js";
import buttons from "../../components/buttons.js";
import {
  errorContainer,
  imageCardContainer,
  v2Flags,
  v2Payload,
} from "../../utils/componentsV2.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Get a random meme"),

  async execute(interaction) {
    await showMeme(interaction);
  },
};

async function showMeme(interaction, isUpdate = false) {
  try {
    const response = await fetch("https://meme-api.com/gimme");
    const data = await response.json();

    const memeButtons = buttons.actions([
      { customId: "meme_next", label: "Meme tiếp theo", emoji: "🔄", style: 1 },
      {
        customId: "meme_upvote",
        label: data.ups.toString(),
        emoji: "⭐",
        style: 2,
      },
    ]);

    const container = imageCardContainer({
      title: data.title,
      color: config.colors.primary,
      imageUrl: data.url,
      footer: `r/${data.subreddit} • 👍 ${data.ups}`,
      rows: [memeButtons],
    });

    if (isUpdate) {
      await interaction.update(v2Payload(container));
    } else {
      const message = await interaction.reply({
        ...v2Payload(container),
        fetchReply: true,
      });

      const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 120000,
      });

      collector.on("collect", async (buttonInteraction) => {
        if (buttonInteraction.customId === "meme_next") {
          await showMeme(buttonInteraction, true);
        }
      });

      collector.on("end", () => {
        message
          .edit({
            components: [container],
            flags: v2Flags(),
          })
          .catch(() => {});
      });
    }
  } catch (error) {
    const payload = v2Payload(
      errorContainer("Lỗi", "Không lấy được meme. Vui lòng thử lại!"),
    );

    if (isUpdate) {
      await interaction.update(payload);
    } else {
      await interaction.reply(payload);
    }
  }
}
