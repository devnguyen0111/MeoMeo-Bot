import { Events } from "discord.js";
import logger from "../utils/logger.js";
import CommandStats from "../models/CommandStats.js";
import {
  errorContainer,
  v2Payload,
} from "../utils/componentsV2.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isButton()) {
      if (interaction.customId.startsWith("streak_claim")) {
        const { handleStreakClaim } = await import("../commands/fun/streak.js");
        await handleStreakClaim(interaction);
        return;
      }

      if (interaction.customId.startsWith("nsfw_")) {
        await handleNsfwButton(interaction);
        return;
      }

      return;
    }
  },
};

async function handleCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  const stats = interaction.client.stats;
  if (stats) {
    stats.totalCommands += 1;
    const current = stats.commandUsage.get(interaction.commandName) || 0;
    stats.commandUsage.set(interaction.commandName, current + 1);

    try {
      await CommandStats.updateOne(
        { key: "global" },
        {
          $inc: {
            totalCommands: 1,
            [`commandUsage.${interaction.commandName}`]: 1,
          },
        },
        { upsert: true },
      );
    } catch (error) {
      logger.error("Failed to persist command stats:", error);
    }
  }

  try {
    logger.command(interaction.commandName, interaction.user.tag);
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Error executing ${interaction.commandName}:`, error);

    const errorMessage = v2Payload(
      errorContainer("Lỗi", "Đã có lỗi khi thực thi lệnh này!"),
      { ephemeral: true },
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
}

async function handleNsfwButton(interaction) {
  const type = interaction.customId.replace("nsfw_", "");

  await interaction.deferReply();

  const API_URL = "https://nekobot.xyz/api/image";
  const API_KEY = process.env.NEKOBOT_API_KEY;

  try {
    const response = await fetch(`${API_URL}?type=${type}`, {
      headers: {
        ...(API_KEY ? { Authorization: API_KEY } : {}),
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

    const { ContainerBuilder, ButtonBuilder, ButtonStyle, MessageFlags } =
      await import("discord.js");

    const container = new ContainerBuilder()
      .setAccentColor(0xff0000)
      .addTextDisplayComponents((td) =>
        td.setContent(`## 🔞 ${type.charAt(0).toUpperCase() + type.slice(1)}`),
      )
      .addMediaGalleryComponents((mg) =>
        mg.addItems((item) => item.setURL(data.message)),
      )
      .addTextDisplayComponents((td) =>
        td.setContent(
          `*Yêu cầu bởi ${interaction.user.tag} • Nội dung NSFW • 18+*`,
        ),
      )
      .addActionRowComponents((ar) =>
        ar.addComponents(
          new ButtonBuilder()
            .setLabel("Tải xuống")
            .setStyle(ButtonStyle.Link)
            .setURL(data.message)
            .setEmoji("📥"),
        ),
      );

    await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    try {
      await interaction.message.delete();

      const { createNsfwMenu } = await import("../commands/fun/nsfwmenu.js");
      const menuMessage = createNsfwMenu();

      await interaction.channel.send(menuMessage);
    } catch (error) {
      logger.error("Failed to refresh menu:", error);
    }
  } catch (error) {
    logger.error("NSFW button error:", error);
    await interaction.editReply(
      v2Payload(
        errorContainer("Lỗi", "Không lấy được ảnh. Vui lòng thử lại sau."),
      ),
    );
  }
}
