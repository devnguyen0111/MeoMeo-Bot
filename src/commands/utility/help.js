import { SlashCommandBuilder } from "discord.js";
import { customEmbed } from "../../utils/embed.js";
import selectMenus from "../../components/selectMenus.js";
import { awaitSelectMenu, handleTimeout } from "../../utils/collectors.js";
import config from "../../../config/config.js";

const commandCategories = {
  moderation: {
    title: "🛡️ Moderation Commands",
    commands: [
      { name: "/kick", description: "Kick a member from the server" },
      { name: "/ban", description: "Ban a member from the server" },
      { name: "/mute", description: "Timeout a member" },
      { name: "/clear", description: "Bulk delete messages" },
    ],
  },
  economy: {
    title: "💰 Economy Commands",
    commands: [
      { name: "/balance", description: "Check your or someone's balance" },
      { name: "/daily", description: "Claim your daily reward" },
      { name: "/transfer", description: "Transfer money to another user" },
      { name: "/shop", description: "Browse the shop" },
    ],
  },
  leveling: {
    title: "📊 Leveling Commands",
    commands: [
      { name: "/rank", description: "View your voice rank and XP" },
      { name: "/leaderboard", description: "View server leaderboard" },
      { name: "/voicetime", description: "Check your voice time stats" },
    ],
  },
  fun: {
    title: "🎮 Fun Commands",
    commands: [
      { name: "/meme", description: "Get a random meme" },
      { name: "/nsfw", description: "Get NSFW images (NSFW channels only)" },
      { name: "/nsfwmenu", description: "Create NSFW image menu with buttons" },
    ],
  },
  utility: {
    title: "🔧 Utility Commands",
    commands: [
      { name: "/ping", description: "Check bot latency" },
      { name: "/help", description: "Show this help menu" },
      { name: "/serverinfo", description: "Get server information" },
      { name: "/userinfo", description: "Get user information" },
      { name: "/avatar", description: "Display user avatar" },
    ],
  },
};

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands"),

  async execute(interaction) {
    const embed = customEmbed({
      title: "📚 MeoMeo Bot - Help Menu",
      description: "Select a category below to view commands",
      color: config.colors.primary,
      fields: [
        {
          name: "🛡️ Moderation",
          value: "Server management commands",
          inline: true,
        },
        {
          name: "💰 Economy",
          value: "Currency and shop commands",
          inline: true,
        },
        { name: "📊 Leveling", value: "Voice ranking commands", inline: true },
        { name: "🎮 Fun", value: "Entertainment commands", inline: true },
        { name: "🎵 Music", value: "YouTube music player", inline: true },
        { name: "🔧 Utility", value: "Information commands", inline: true },
      ],
    });

    const menu = selectMenus.helpCategory();

    const message = await interaction.reply({
      embeds: [embed],
      components: [menu],
      fetchReply: true,
    });

    // Collector for category selection
    const menuInteraction = await awaitSelectMenu(
      message,
      interaction.user.id,
      60,
    );

    if (!menuInteraction) {
      await handleTimeout(message);
      return;
    }

    const category = menuInteraction.values[0];
    const categoryData = commandCategories[category];

    const categoryEmbed = customEmbed({
      title: categoryData.title,
      description: "Available commands in this category:",
      color: config.colors.primary,
      fields: categoryData.commands.map((cmd) => ({
        name: cmd.name,
        value: cmd.description,
      })),
    });

    await menuInteraction.update({
      embeds: [categoryEmbed],
      components: [],
    });
  },
};
