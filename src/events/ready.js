import { Events } from "discord.js";
import { REST, Routes } from "discord.js";
import config from "../../config/config.js";
import logger from "../utils/logger.js";

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
          name: "Whatching you sleep...  💤",
          type: 0, // Playing
        },
      ],
      status: "online",
    });

    // Register slash commands
    await registerCommands(client);

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
