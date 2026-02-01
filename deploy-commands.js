import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/config.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

// Load all commands
async function loadCommands() {
  const commandsPath = path.join(__dirname, "src", "commands");
  const commandFolders = fs.readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = await import(`file://${filePath}`);

      if (command.default && command.default.data) {
        commands.push(command.default.data.toJSON());
        console.log(`✓ Loaded command: ${command.default.data.name}`);
      } else {
        console.warn(`⚠ Command at ${filePath} is missing required properties`);
      }
    }
  }

  console.log(`\nTotal commands loaded: ${commands.length}`);
}

// Deploy commands
async function deployCommands() {
  const rest = new REST().setToken(config.token);

  try {
    console.log("\n🔄 Starting deployment...");

    // Clear all existing commands (both guild and global)
    if (config.guildId) {
      console.log(`\n🗑️  Deleting all existing GUILD commands...`);
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: [] },
      );
      console.log("✓ Successfully deleted all guild commands!");
    }

    console.log(`\n🗑️  Deleting all existing GLOBAL commands...`);
    await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
    console.log("✓ Successfully deleted all global commands!");

    // Wait a moment before registering new commands
    console.log("\n⏳ Waiting 2 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Register new commands
    if (config.guildId) {
      console.log(
        `\n📝 Registering ${commands.length} commands to GUILD (${config.guildId})...`,
      );
      const data = await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commands },
      );
      console.log(`✅ Successfully registered ${data.length} guild commands!`);
    } else {
      console.log(`\n📝 Registering ${commands.length} commands GLOBALLY...`);
      const data = await rest.put(Routes.applicationCommands(config.clientId), {
        body: commands,
      });
      console.log(`✅ Successfully registered ${data.length} global commands!`);
      console.log("⚠️  Note: Global commands may take up to 1 hour to update.");
    }

    console.log("\n✨ Deployment completed successfully!");
  } catch (error) {
    console.error("\n❌ Error deploying commands:", error);
    if (error.rawError) {
      console.error("Details:", JSON.stringify(error.rawError, null, 2));
    }
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log("═══════════════════════════════════════");
  console.log("    MeoMeo Bot - Command Deployment    ");
  console.log("═══════════════════════════════════════\n");

  await loadCommands();
  await deployCommands();

  console.log("\n═══════════════════════════════════════");
  console.log("           Deployment Done!            ");
  console.log("═══════════════════════════════════════\n");
}

main();
