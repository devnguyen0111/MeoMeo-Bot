import { SlashCommandBuilder } from "discord.js";
import config from "../../../config/config.js";
import {
  errorContainer,
  imageCardContainer,
  v2Payload,
} from "../../utils/componentsV2.js";

const API_URL = "https://nekobot.xyz/api/image";

export default {
  data: new SlashCommandBuilder()
    .setName("nsfw")
    .setDescription("Get NSFW images (NSFW channels only)")
    .setNSFW(true)
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Image type")
        .setRequired(true)
        .addChoices(
          { name: "Hentai", value: "hentai" },
          { name: "Neko", value: "hneko" },
          { name: "Kitsune", value: "hkitsune" },
          { name: "Kemonomimi", value: "kemonomimi" },
          { name: "Ass", value: "ass" },
          { name: "Pussy", value: "pussy" },
          { name: "Thighs", value: "hthigh" },
          { name: "Boobs", value: "hboobs" },
          { name: "Paizuri", value: "paizuri" },
          { name: "Anal", value: "hanal" },
          { name: "Yaoi", value: "yaoi" },
          { name: "Tentacle", value: "tentacle" },
          { name: "4K", value: "4k" },
        ),
    ),

  async execute(interaction) {
    if (!interaction.channel.nsfw) {
      return interaction.reply(
        v2Payload(
          errorContainer(
            "Chỉ NSFW",
            "Lệnh này chỉ dùng trong kênh NSFW!",
          ),
          { ephemeral: true },
        ),
      );
    }

    await interaction.deferReply();

    const type = interaction.options.getString("type");
    const apiKey = process.env.NEKOBOT_API_KEY;

    try {
      const response = await fetch(`${API_URL}?type=${type}`, {
        headers: {
          ...(apiKey ? { Authorization: apiKey } : {}),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      if (!data.success || !data.message) {
        throw new Error("Invalid API response");
      }

      const container = imageCardContainer({
        title: `🔞 ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        imageUrl: data.message,
        color: config.colors.error,
        footer: "Nội dung NSFW • 18+",
      });

      await interaction.editReply(v2Payload(container));
    } catch (error) {
      console.error("NSFW command error:", error);
      await interaction.editReply(
        v2Payload(
          errorContainer("Lỗi", "Không lấy được ảnh. Vui lòng thử lại sau."),
        ),
      );
    }
  },
};
