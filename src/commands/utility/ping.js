import { SlashCommandBuilder } from "discord.js";
import { infoEmbed } from "../../utils/embed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency and API ping"),

  async execute(interaction) {
    const sent = await interaction.reply({
      embeds: [infoEmbed("🏓 Đang ping...", "Đang tính độ trễ...")],
      fetchReply: true,
    });

    const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = infoEmbed("🏓 Pong!", null).addFields(
      { name: "📡 Độ trễ bot", value: `\`${botLatency}ms\``, inline: true },
      { name: "🌐 Độ trễ API", value: `\`${apiLatency}ms\``, inline: true },
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
