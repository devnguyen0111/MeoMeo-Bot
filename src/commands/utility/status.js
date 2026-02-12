import { SlashCommandBuilder, version as djsVersion } from "discord.js";
import { customEmbed } from "../../utils/embed.js";

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(1)} ${units[index]}`;
}

export default {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("View bot status and statistics"),

  async execute(interaction) {
    const { client } = interaction;
    const stats = client.stats;
    const startedAt = stats?.startedAt || Date.now() - process.uptime() * 1000;
    const uptimeMs = Date.now() - startedAt;

    const commandUsage = stats?.commandUsage || new Map();
    const totalCommands = stats?.totalCommands || 0;
    const uniqueCommands = commandUsage.size;

    const topCommands = [...commandUsage.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], index) => `${index + 1}. /${name} - ${count}`)
      .join("\n");

    const memory = process.memoryUsage();
    const embed = customEmbed({
      title: "🤖 Bot Status",
      fields: [
        {
          name: "⏱️ Uptime",
          value: `${formatDuration(uptimeMs)}\nStarted <t:${Math.floor(
            startedAt / 1000,
          )}:R>`,
          inline: true,
        },
        {
          name: "📊 Commands",
          value: `Total: ${totalCommands}\nUnique: ${uniqueCommands}`,
          inline: true,
        },
        {
          name: "📡 Connection",
          value: `Ping: ${Math.round(client.ws.ping)}ms`,
          inline: true,
        },
        {
          name: "🧠 Memory",
          value: `RSS: ${formatBytes(memory.rss)}\nHeap: ${formatBytes(
            memory.heapUsed,
          )}`,
          inline: true,
        },
        {
          name: "🏠 Servers",
          value: `Guilds: ${client.guilds.cache.size}\nUsers: ${client.users.cache.size}`,
          inline: true,
        },
        {
          name: "⚙️ Versions",
          value: `Node: ${process.version}\ndiscord.js: v${djsVersion}`,
          inline: true,
        },
        {
          name: "🔥 Top Commands",
          value: topCommands || "No data yet.",
          inline: false,
        },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
