import { SlashCommandBuilder } from "discord.js";
import { cardContainer, v2Payload } from "../../utils/componentsV2.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency and API ping"),

  async execute(interaction) {
    const sent = await interaction.reply({
      ...v2Payload(
        cardContainer({
          title: "🏓 Đang ping...",
          description: "Đang tính độ trễ...",
        }),
      ),
      fetchReply: true,
    });

    const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const container = cardContainer({
      title: "🏓 Pong!",
      fields: [
        { name: "📡 Độ trễ bot", value: `\`${botLatency}ms\``, inline: true },
        { name: "🌐 Độ trễ API", value: `\`${apiLatency}ms\``, inline: true },
      ],
    });

    await interaction.editReply(v2Payload(container));
  },
};
