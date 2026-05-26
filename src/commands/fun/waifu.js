import { SlashCommandBuilder } from "discord.js";
import { customEmbed } from "../../utils/embed.js";
import config from "../../../config/config.js";
import { getWaifuImage } from "../../utils/waifuUtils.js";

const SFW_CATEGORIES = [
  "waifu",
  "neko",
  "shinobu",
  "megumin",
  "bully",
  "cuddle",
  "cry",
  "hug",
  "awoo",
  "kiss",
  "lick",
  "pat",
  "smug",
  "bonk",
  "yeet",
  "blush",
  "smile",
  "wave",
  "highfive",
  "handhold",
  "nom",
  "bite",
  "glomp",
  "slap",
  "kill",
];

const NSFW_CATEGORIES = ["waifu", "neko", "trap", "blowjob"];

export default {
  data: new SlashCommandBuilder()
    .setName("waifu")
    .setDescription("Get a random anime image")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("sfw")
        .setDescription("Get a safe-for-work anime image")
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("Image category")
            .setRequired(true)
            .addChoices(
              ...SFW_CATEGORIES.map((c) => ({
                name: c.charAt(0).toUpperCase() + c.slice(1),
                value: c,
              })),
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("nsfw")
        .setDescription("Get a NSFW anime image (NSFW channels only)")
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("Image category")
            .setRequired(true)
            .addChoices(
              ...NSFW_CATEGORIES.map((c) => ({
                name: c.charAt(0).toUpperCase() + c.slice(1),
                value: c,
              })),
            ),
        ),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const type = interaction.options.getSubcommand();
    const category = interaction.options.getString("category");

    // Validation for NSFW
    if (type === "nsfw" && !interaction.channel.nsfw) {
      return interaction.editReply({
        embeds: [
          customEmbed({
            title: "❌ Chỉ NSFW",
            description: "Lệnh này chỉ dùng trong kênh NSFW!",
            color: config.colors.error,
          }),
        ],
      });
    }

    try {
      const imageUrl = await getWaifuImage(category, type);

      if (!imageUrl) {
        throw new Error("Failed to fetch image from API");
      }

      const embed = customEmbed({
        title: `${type === "nsfw" ? "🔞 " : ""}${category.charAt(0).toUpperCase() + category.slice(1)}`,
        image: imageUrl,
        color: config.colors.primary,
        footer: { text: `Cung cấp bởi API nguồn • ${type.toUpperCase()}` },
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Waifu command error:", error);
      await interaction.editReply({
        embeds: [
          customEmbed({
            title: "❌ Lỗi",
            description:
              "Không lấy được ảnh. Vui lòng kiểm tra danh mục hoặc thử lại sau.",
            color: config.colors.error,
          }),
        ],
      });
    }
  },
};
