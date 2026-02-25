import { EmbedBuilder, Events } from "discord.js";
import { REST, Routes } from "discord.js";
import cron from "node-cron";
import config from "../../config/config.js";
import logger from "../utils/logger.js";
import { buildActionDescription, getWaifuImage } from "../utils/waifuUtils.js";

const KISS_CHANNEL_ID = "1467570083625828576";
const KISSER_ID = "229203044372316160";
const KISSED_ID = "776634309476876299";
const KISS_TIMEZONE = "Asia/Ho_Chi_Minh";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.success(`Bot logged in as ${client.user.tag}`);
    logger.info(`Serving ${client.guilds.cache.size} guild(s)`);

    // Set bot presence
    client.user.setPresence({
      activities: [
        {
          name: "Đang canh bạn ngủ... 💤",
          type: 0, // Playing
        },
      ],
      status: "online",
    });

    // Register slash commands
    await registerCommands(client);

    scheduleDailyKiss(client);

    logger.success("Bot is ready!");
  },
};

async function registerCommands(client) {
  try {
    const commands = [...client.commands.values()].map((command) =>
      command.data.toJSON(),
    );

    // Register commands to single guild
    const rest = new REST().setToken(config.token);

    logger.info(`Registering ${commands.length} application (/) commands...`);

    const data = await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands },
    );

    logger.success(
      `Successfully registered ${data.length} application commands!`,
    );
  } catch (error) {
    logger.error("Failed to register commands:", error);
  }
}

function scheduleDailyKiss(client) {
  const task = cron.schedule(
    "0 7 * * *",
    async () => {
      try {
        const channel = await client.channels.fetch(KISS_CHANNEL_ID);
        if (!channel || !channel.isTextBased()) {
          logger.warn(
            `Daily kiss channel not found or not text-based: ${KISS_CHANNEL_ID}`,
          );
          return;
        }

        const [kisser, kissed] = await Promise.all([
          client.users.fetch(KISSER_ID),
          client.users.fetch(KISSED_ID),
        ]);

        const description = buildActionDescription(
          "kiss",
          kisser.username,
          kissed.username,
          KISSER_ID === KISSED_ID,
        );
        const imageUrl = await getWaifuImage("kiss", "sfw");

        if (imageUrl) {
          const embed = new EmbedBuilder()
            .setDescription(description)
            .setColor(config.colors?.primary || 0x00ae86)
            .setImage(imageUrl)
            .setTimestamp();
          await channel.send({ embeds: [embed] });
        } else {
          await channel.send({ content: description });
          logger.warn("Daily kiss image unavailable, sent text only.");
        }
        logger.info("Sent daily kiss message.");
      } catch (error) {
        logger.error("Failed to send daily kiss message:", error);
      }
    },
    { timezone: KISS_TIMEZONE },
  );

  task.start();
  logger.info(`Scheduled daily kiss at 07:00 (${KISS_TIMEZONE}).`);
}
