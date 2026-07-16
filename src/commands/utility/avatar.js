import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import {
  imageCardContainer,
  v2Flags,
  v2Payload,
} from "../../utils/componentsV2.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Display user avatar")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get avatar from")
        .setRequired(false),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const sizeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("256")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`avatar_256_${user.id}`),
      new ButtonBuilder()
        .setLabel("512")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`avatar_512_${user.id}`),
      new ButtonBuilder()
        .setLabel("1024")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`avatar_1024_${user.id}`),
      new ButtonBuilder()
        .setLabel("2048")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`avatar_2048_${user.id}`),
    );

    const buildContainer = (size = 1024) => {
      const url = user.displayAvatarURL({ dynamic: true, size });
      return imageCardContainer({
        title:
          size === 1024
            ? `Ảnh đại diện của ${user.username}`
            : `Ảnh đại diện của ${user.username} (${size}x${size})`,
        description: `[Tải xuống](${url})`,
        color: config.colors.primary,
        imageUrl: url,
        rows: [sizeRow],
      });
    };

    const message = await interaction.reply({
      ...v2Payload(buildContainer()),
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) =>
        i.user.id === interaction.user.id && i.customId.startsWith("avatar_"),
      time: 120000,
    });

    collector.on("collect", async (buttonInteraction) => {
      const size = parseInt(buttonInteraction.customId.split("_")[1], 10);
      await buttonInteraction.update(v2Payload(buildContainer(size)));
    });

    collector.on("end", () => {
      message
        .edit({
          components: [buildContainer()],
          flags: v2Flags(),
        })
        .catch(() => {});
    });
  },
};
