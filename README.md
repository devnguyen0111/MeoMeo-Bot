# MeoMeo Discord Bot

Discord bot cho một máy chủ với voice leveling, moderation, nhạc YouTube, lệnh giải trí và hành động anime. Xây dựng bằng **discord.js ^14.27** và MongoDB, giao diện dùng **Discord Components V2** (Container, Section, MediaGallery, Buttons, Select Menus, Modals).

## Features

### Moderation
- `/kick` - Kick thành viên (xác nhận bằng nút)
- `/ban` - Cấm thành viên (modal nhập lý do)
- `/mute` - Timeout thành viên
- `/clear` - Xóa hàng loạt tin nhắn
- `/nickname` - Đổi/xóa biệt danh

### Voice Leveling
- `/rank` - Xem hạng voice, XP và tiến độ
- `/leaderboard` - Bảng xếp hạng có phân trang
- `/voicetime` - Thống kê thời gian voice
- Tự động cộng XP khi ở kênh voice
- Công thức level: `100 * (level ^ 1.5)` XP mỗi cấp

### Fun
- `/meme` - Meme ngẫu nhiên + nút tiếp theo
- `/streak` - Minigame streak hằng ngày
- `/waifu` - Ảnh anime SFW/NSFW
- `/nsfw` - Ảnh NSFW theo loại (chỉ kênh NSFW)
- `/nsfwmenu` - Menu NSFW sticky với nút

### Actions
- `/kiss`, `/hug`, `/pat`, `/slap`, `/poke`, `/cuddle`, `/cry`, `/smile`, `/kill`

### Music
- `/play`, `/pause`, `/resume`, `/skip`, `/stop`, `/shuffle`
- `/queue`, `/nowplaying`, `/volume`

### Utility
- `/ping`, `/help`, `/status`, `/serverinfo`, `/userinfo`, `/avatar`, `/stayvc`

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local hoặc Atlas)
- Discord Bot Token với intents phù hợp

### Installation

```bash
cd MeoMeo-Bot
npm install
```

Copy `.env.example` thành `.env`:

```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_server_id_here
MONGO_URI=mongodb://localhost:27017/meomeo-bot

VOICE_XP_PER_MINUTE=10
MUSIC_DEFAULT_VOLUME=80
NEKOBOT_API_KEY=your_nekobot_api_key_here
```

Chạy bot:

```bash
npm run dev   # development
npm start     # production
npm run deploy  # đăng ký slash commands thủ công
```

## Components V2

Bot dùng `MessageFlags.IsComponentsV2` cho phản hồi slash command. Helpers nằm tại `src/utils/componentsV2.js`:
- `cardContainer` - thẻ thông tin (rank, serverinfo, help...)
- `imageCardContainer` - ảnh + mô tả (meme, waifu, avatar...)
- `successContainer` / `errorContainer` - thông báo ngắn
- `v2Payload()` - bọc container + flags chuẩn

Modal (ban reason...) vẫn dùng Modal API; không gắn flag V2 cho modal.

## Project Structure

```
MeoMeo-Bot/
├── src/
│   ├── commands/       # Slash commands theo danh mục
│   ├── components/     # Button, select menu, modal builders
│   ├── events/         # Event handlers
│   ├── models/         # MongoDB schemas (User, CommandStats)
│   └── utils/          # componentsV2, collectors, logger...
├── config/
├── data/               # Fishing design data (WIP, chưa có lệnh)
└── package.json
```

## Database Models

- **User** - XP, level, voice time, streak, warnings
- **CommandStats** - Thống kê lệnh toàn cục

## Bot Permissions

- Kick Members, Ban Members, Moderate Members
- Manage Messages, Manage Nicknames
- View Channels, Send Messages, Connect, Speak
- Read Message History

## Intents

- Guilds, GuildMembers, GuildVoiceStates, GuildMessages

## Troubleshooting

**Lệnh không hiện?** Kiểm tra `CLIENT_ID`, `GUILD_ID` và scope `applications.commands`.

**Voice XP không chạy?** Bật intent `GuildVoiceStates`, kiểm tra MongoDB.

**NSFW API lỗi?** Thêm `NEKOBOT_API_KEY` vào `.env`.

## License

ISC
