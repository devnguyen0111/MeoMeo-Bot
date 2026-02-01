import { Events } from 'discord.js';
import { REST, Routes } from 'discord.js';
import config from '../../config/config.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.success(`Bot logged in as ${client.user.tag}`);
        logger.info(`Serving ${client.guilds.cache.size} guild(s)`);
        
        // Set bot presence
        client.user.setPresence({
            activities: [{
                name: 'MeoMeo Server',
                type: 0 // Playing
            }],
            status: 'online'
        });
        
        // Register slash commands
        await registerCommands(client);
        
        logger.success('Bot is ready!');
    }
};

async function registerCommands(client) {
    try {
        const commands = [];
        const commandsPath = path.join(__dirname, '..', 'commands');
        
        // Read all command folders
        const commandFolders = fs.readdirSync(commandsPath);
        
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = await import(`file://${filePath}`);
                
                if (command.default && command.default.data && command.default.execute) {
                    commands.push(command.default.data.toJSON());
                    logger.debug(`Loaded command: ${command.default.data.name}`);
                }
            }
        }
        
        // Register commands to single guild
        const rest = new REST().setToken(config.token);
        
        logger.info(`Registering ${commands.length} application (/) commands...`);
        
        const data = await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );
        
        logger.success(`Successfully registered ${data.length} application commands!`);
    } catch (error) {
        logger.error('Failed to register commands:', error);
    }
}
