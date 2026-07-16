import { SlashCommandBuilder, version as djsVersion } from "discord.js";
import { cardContainer, v2Payload } from "../../utils/componentsV2.js";

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days) parts.push(`${days} ngày`);
  if (hours) parts.push(`${hours} giờ`);
  if (minutes) parts.push(`${minutes} phút`);
  parts.push(`${seconds} giây`);

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
    const container = cardContainer({
      title: "🤖 Trạng thái bot",
      fields: [
        {
          name: "⏱️ Thời gian hoạt động",
          value: `${formatDuration(uptimeMs)}\nBắt đầu <t:${Math.floor(
            startedAt / 1000,
          )}:R>`,
          inline: true,
        },
        {
          name: "📊 Lệnh",
          value: `Tổng: ${totalCommands}\nDuy nhất: ${uniqueCommands}`,
          inline: true,
        },
        {
          name: "📡 Kết nối",
          value: `Ping: ${Math.round(client.ws.ping)}ms`,
          inline: true,
        },
        {
          name: "🧠 Bộ nhớ",
          value: `RSS: ${formatBytes(memory.rss)}\nHeap: ${formatBytes(
            memory.heapUsed,
          )}`,
          inline: true,
        },
        {
          name: "🏠 Máy chủ",
          value: `Máy chủ: ${client.guilds.cache.size}\nNgười dùng: ${client.users.cache.size}`,
          inline: true,
        },
        {
          name: "⚙️ Phiên bản",
          value: `Node: ${process.version}\ndiscord.js: v${djsVersion}`,
          inline: true,
        },
        {
          name: "🔥 Lệnh dùng nhiều",
          value: topCommands || "Chưa có dữ liệu.",
        },
      ],
    });

    await interaction.reply(v2Payload(container));
  },
};
