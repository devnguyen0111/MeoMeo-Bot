import { Client, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import config from "../config/config.js";
import logger from "./utils/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Initialize commands collection
client.commands = new Collection();

// Load commands
async function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = await import(`file://${filePath}`);

      if (command.default && command.default.data && command.default.execute) {
        client.commands.set(command.default.data.name, command.default);
        logger.debug(`Loaded command: ${command.default.data.name}`);
      } else {
        logger.warn(`Command at ${filePath} is missing required properties`);
      }
    }
  }

  logger.info(`Loaded ${client.commands.size} commands`);
}

// Load events
async function loadEvents() {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await import(`file://${filePath}`);

    if (event.default && event.default.name && event.default.execute) {
      if (event.default.once) {
        client.once(event.default.name, (...args) =>
          event.default.execute(...args),
        );
      } else {
        client.on(event.default.name, (...args) =>
          event.default.execute(...args),
        );
      }
      logger.debug(`Loaded event: ${event.default.name}`);
    } else {
      logger.warn(`Event at ${filePath} is missing required properties`);
    }
  }

  logger.info(`Loaded ${eventFiles.length} events`);
}

// Connect to MongoDB
async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.success("Connected to MongoDB");
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Graceful shutdown
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");

      client.destroy();
      logger.info("Discord client destroyed");

      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

// Main initialization
async function main() {
  try {
    logger.info("Starting MeoMeo Bot...");

    // Connect to database
    await connectDatabase();

    // Load commands and events
    await loadCommands();
    await loadEvents();

    // Setup graceful shutdown
    setupGracefulShutdown();

    // Login to Discord
    await client.login(config.token);
  } catch (error) {
    logger.error("Fatal error during initialization:", error);
    process.exit(1);
  }
}

// Start the bot
main();
