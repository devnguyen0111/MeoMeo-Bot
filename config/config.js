import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["BOT_TOKEN", "CLIENT_ID", "GUILD_ID", "MONGO_URI"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default {
  // Discord Configuration
  token: process.env.BOT_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  // MongoDB Configuration
  mongoUri: process.env.MONGO_URI,

  // Bot Settings
  voiceXpPerMinute: parseInt(process.env.VOICE_XP_PER_MINUTE) || 10,

  // XP & Leveling
  xpFormula: (level) => Math.floor(100 * Math.pow(level, 1.5)),

  // Colors for embeds
  colors: {
    primary: 0x5865f2, // Discord Blurple
    success: 0x57f287, // Green
    error: 0xed4245, // Red
    warning: 0xfee75c, // Yellow
    info: 0x5865f2, // Blue
  },

  // Emojis
  emojis: {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    loading: "⏳",
    coin: "💰",
    xp: "⭐",
    voice: "🎙️",
    level: "📊",
  },
};
