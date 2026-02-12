import { Events } from "discord.js";
import logger from "../utils/logger.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    }

    // Handle button interactions
    else if (interaction.isButton()) {
      // Handle streak button
      if (interaction.customId.startsWith("streak_claim")) {
        const { handleStreakClaim } = await import("../commands/fun/streak.js");
        await handleStreakClaim(interaction);
        return;
      }

      // Handle NSFW buttons
      if (interaction.customId.startsWith("nsfw_")) {
        await handleNsfwButton(interaction);
        return;
      }

      // Other button interactions are handled within command files
      // using collectors, so we don't need to handle them here
      return;
    }

    // Handle select menu interactions
    else if (interaction.isStringSelectMenu()) {
      // Select menu interactions are handled within command files
      // using collectors, so we don't need to handle them here
      return;
    }

    // Handle modal submissions
    else if (interaction.isModalSubmit()) {
      // Modal submissions are handled within command files
      // using collectors, so we don't need to handle them here
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

  try {
    logger.command(interaction.commandName, interaction.user.tag);
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Error executing ${interaction.commandName}:`, error);

    const errorMessage = {
      content: "❌ There was an error while executing this command!",
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
}

async function handleNsfwButton(interaction) {
  // Extract type from button customId (e.g., nsfw_hentai -> hentai)
  const type = interaction.customId.replace("nsfw_", "");

  await interaction.deferReply(); // Public reply

  const API_URL = "https://nekobot.xyz/api/image";
  const API_KEY = "015445535454455354D6";

  try {
    // Fetch image from API
    const response = await fetch(`${API_URL}?type=${type}`, {
      headers: {
        Authorization: API_KEY,
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

    // Create embed with image
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } =
      await import("discord.js");

    const embed = new EmbedBuilder()
      .setTitle(`🔞 ${type.charAt(0).toUpperCase() + type.slice(1)}`)
      .setImage(data.message)
      .setColor(0xff0000)
      .setFooter({
        text: `Requested by ${interaction.user.tag} • NSFW Content • 18+`,
      })
      .setTimestamp();

    // Create download button
    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Download")
        .setStyle(ButtonStyle.Link)
        .setURL(data.message)
        .setEmoji("📥"),
    );

    // Send embed with button
    await interaction.editReply({
      embeds: [embed],
      components: [downloadButton],
    });

    // Sticky functionality: Delete old menu and resend at bottom
    try {
      // Delete the original menu message
      await interaction.message.delete();

      // Import and resend menu
      const { createNsfwMenu } = await import("../commands/fun/nsfwmenu.js");
      const menuMessage = createNsfwMenu();

      // Send new menu at bottom of channel
      await interaction.channel.send(menuMessage);
    } catch (error) {
      // If delete/resend fails, just continue (menu stays)
      logger.error("Failed to refresh menu:", error);
    }
  } catch (error) {
    logger.error("NSFW button error:", error);
    await interaction.editReply({
      content: "❌ Failed to fetch image. Please try again later.",
    });
  }
}
