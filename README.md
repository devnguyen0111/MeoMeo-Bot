# MeoMeo Discord Bot

A feature-rich Discord bot for single-server use with voice-based leveling, economy system, moderation tools, YouTube music player, and fun commands. Built with Discord.js v14 and MongoDB, featuring interactive Discord Components v2 (Buttons, Select Menus, Modals).

## ✨ Features

### 🛡️ Moderation
- `/kick` - Kick members with confirmation
- `/ban` - Ban members with modal input for reason
- `/mute` - Timeout members
- `/clear` - Bulk delete messages

### 💰 Economy
- `/balance` - Check wallet, bank, and inventory
- `/daily` - Claim daily rewards (24h cooldown)
- `/transfer` - Transfer money with modal input and confirmation
- `/shop` - Interactive shop with category and item select menus

### 📊 Voice Leveling
- `/rank` - View voice-based XP, level, and progress
- `/leaderboard` - Interactive paginated leaderboard
- `/voicetime` - Detailed voice statistics
- Automatic XP gain based on time in voice channels
- Configurable XP rate per minute

### 🎮 Fun Commands
- `/meme` - Random memes with next button
- `/nsfw` - NSFW images from various types (NSFW channels only)
- `/nsfwmenu` - Create sticky NSFW menu with interactive buttons

### 🎵 Music System
- `/play` - Play songs from YouTube (URL or search)
- `/pause` - Pause playback
- `/resume` - Resume playback
- `/skip` - Skip songs (with amount option)
- `/stop` - Stop and clear queue
- `/queue` - View current queue
- `/nowplaying` - Show current song info
- `/volume` - Adjust volume (1-100)
- Auto-disconnect after inactivity
- Queue management with loop modes

### 🔧 Utility
- `/ping` - Check bot and API latency
- `/help` - Interactive help menu with category selection
- `/serverinfo` - Detailed server information
- `/userinfo` - User information with bot stats integration
- `/avatar` - Display user avatar with size options

## 🚀 Setup

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or Atlas)
- Discord Bot Token with proper intents

### Installation

1. **Clone the repository**
```bash
cd MeoMeo-Bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**

Copy `.env.example` to `.env` and fill in your details:
```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_server_id_here
MONGO_URI=mongodb://localhost:27017/meomeo-bot

# Optional settings
VOICE_XP_PER_MINUTE=10
DAILY_REWARD_MIN=100
DAILY_REWARD_MAX=500
```

4. **Start the bot**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 📝 Configuration

### Required Bot Permissions
- Kick Members
- Ban Members
- Moderate Members (Timeout)
- Manage Messages
- View Channels
- Send Messages
- Embed Links
- Read Message History

### Required Intents
- Guilds
- GuildMembers
- GuildVoiceStates
- GuildMessages

## 🎯 Voice Leveling System

Users gain XP automatically while in voice channels:
- **Default**: 10 XP per minute
- **AFK channels**: Ignored
- **Level formula**: `100 * (level ^ 1.5)` XP required per level
- Tracks total and daily voice time

## 💡 Interactive Components

All commands use Discord Components v2 for rich interactions:
- **Buttons**: Confirmations, navigation, actions
- **Select Menus**: Shop categories, help menu
- **Modals**: Transfer money, moderation reasons
- **Collectors**: Handle timeouts and user interactions

## 📂 Project Structure

```
MeoMeo-Bot/
├── src/
│   ├── commands/         # Slash commands by category
│   ├── components/       # Button, select menu, modal builders
│   ├── events/           # Discord event handlers
│   ├── models/           # MongoDB schemas
│   └── utils/            # Helper functions
├── config/              # Configuration files
└── package.json
```

## 🛠️ Development

### Adding New Commands

1. Create a new file in `src/commands/<category>/commandname.js`
2. Export default object with `data` and `execute` properties
3. Bot will auto-register commands on startup

Example:
```javascript
import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('example')
        .setDescription('Example command'),
    
    async execute(interaction) {
        await interaction.reply('Hello!');
    }
};
```

### Database Models

- **User**: XP, level, voice time, warnings
- **Economy**: Balance, bank, inventory, transactions

## 📊 Commands Reference

| Category | Commands | Count |
|----------|----------|-------|
| Moderation | kick, ban, mute, warn, clear | 5 |
| Economy | balance, daily, transfer, shop | 4 |
| Leveling | rank, leaderboard, voicetime | 3 |
| Fun | meme, nsfw, nsfwmenu | 3 |
| Music | play, pause, resume, skip, stop, queue, nowplaying, volume | 8 |
| Utility | ping, help, serverinfo, userinfo, avatar | 5 |
| **Total** | | **28** |

## 🤝 Contributing

This is a private server bot. Feel free to customize for your own use!

## 📄 License

ISC License

## 🐛 Troubleshooting

**Commands not showing up?**
- Ensure `CLIENT_ID` and `GUILD_ID` are correct
- Check bot has `applications.commands` scope

**Voice tracking not working?**
- Verify `GuildVoiceStates` intent is enabled
- Check MongoDB connection

**Permission errors?**
- Ensure bot role is high enough in hierarchy
- Verify required permissions are granted

## 💬 Support

For issues or questions, contact your server administrator.
