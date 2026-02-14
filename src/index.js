import { Client, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Player } from "discord-player";
import extractorPkg from "@discord-player/extractor";
import { YoutubeExtractor } from "discord-player-youtube";
import ffmpegStatic from "ffmpeg-static";
import config from "../config/config.js";
import logger from "./utils/logger.js";
import CommandStats from "./models/CommandStats.js";

dotenv.config();

const { DefaultExtractors } = extractorPkg.default || extractorPkg;

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
client.stats = {
  startedAt: Date.now(),
  totalCommands: 0,
  commandUsage: new Map(),
};

if (ffmpegStatic && !process.env.FFMPEG_PATH) {
  process.env.FFMPEG_PATH = ffmpegStatic;
}

client.player = new Player(client);

const playbackErrorCooldown = new Map();

client.player.events.on("playerError", (queue, error) => {
  logger.error(`Player error in ${queue.guild.id}:`, error);
  const guildId = queue?.guild?.id;
  if (!guildId) {
    return;
  }

  const now = Date.now();
  const lastNotice = playbackErrorCooldown.get(guildId) || 0;
  if (now - lastNotice < 5000) {
    return;
  }

  if (queue?.node?.isPlaying()) {
    return;
  }

  playbackErrorCooldown.set(guildId, now);

  const channel = queue?.metadata?.channel;
  if (!channel) {
    return;
  }

  const message = String(error?.message || error || "");
  const requiresAuth = message.toLowerCase().includes("signed in");
  const content = requiresAuth
    ? "❌ This track requires a signed-in YouTube session. Please try another song or add a cookie."
    : "❌ Failed to play this track. Please try another song.";

  channel.send({ content }).catch(() => {});
});

client.player.events.on("error", (queue, error) => {
  logger.error(`Queue error in ${queue.guild.id}:`, error);
});

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

async function loadCommandStats() {
  const doc = await CommandStats.findOneAndUpdate(
    { key: "global" },
    { $setOnInsert: { key: "global" } },
    { new: true, upsert: true },
  );

  client.stats.totalCommands = doc.totalCommands || 0;
  client.stats.commandUsage = new Map(doc.commandUsage || []);
}

async function setupMusicSystem() {
  try {
    await client.player.extractors.loadMulti(DefaultExtractors);

    try {
      await client.player.extractors.register(YoutubeExtractor, {
        filterAutoplayTracks: true,
        disableYTJSLog: true,
      });
    } catch (error) {
      logger.warn("Failed to register YouTube extractor:", error);
    }

    logger.success("Music system initialized");
  } catch (error) {
    logger.error("Failed to initialize music system:", error);
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

    // Load persistent command stats
    await loadCommandStats();

    // Load commands and events
    await loadCommands();
    await loadEvents();

    // Setup music system
    await setupMusicSystem();

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
