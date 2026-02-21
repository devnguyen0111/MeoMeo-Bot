import { SlashCommandBuilder } from "discord.js";
import { customEmbed } from "../../utils/embed.js";
import selectMenus from "../../components/selectMenus.js";
import { awaitSelectMenu, handleTimeout } from "../../utils/collectors.js";
import config from "../../../config/config.js";

const commandCategories = {
  moderation: {
    title: "🛡️ Lệnh quản trị",
    commands: [
      { name: "/kick", description: "Kick một thành viên khỏi máy chủ" },
      { name: "/ban", description: "Cấm một thành viên khỏi máy chủ" },
      { name: "/mute", description: "Timeout một thành viên" },
      { name: "/clear", description: "Xóa hàng loạt tin nhắn" },
    ],
  },
  leveling: {
    title: "📊 Lệnh cấp độ",
    commands: [
      { name: "/rank", description: "Xem hạng voice và XP" },
      { name: "/leaderboard", description: "Xem bảng xếp hạng máy chủ" },
      { name: "/voicetime", description: "Xem thống kê thời gian voice" },
    ],
  },
  fun: {
    title: "🎮 Lệnh giải trí",
    commands: [
      { name: "/meme", description: "Nhận meme ngẫu nhiên" },
      { name: "/streak", description: "Chơi minigame streak hằng ngày" },
      { name: "/waifu", description: "Nhận ảnh anime ngẫu nhiên" },
      { name: "/nsfw", description: "Nhận ảnh NSFW (chỉ kênh NSFW)" },
      { name: "/nsfwmenu", description: "Tạo menu ảnh NSFW bằng nút" },
    ],
  },
  actions: {
    title: "🎭 Lệnh hành động",
    commands: [
      { name: "/kiss", description: "Hôn ai đó! 😘" },
      { name: "/hug", description: "Ôm ai đó thật chặt! 🤗" },
      { name: "/pat", description: "Xoa đầu ai đó! 💆" },
      { name: "/slap", description: "Tát ai đó! 👋" },
      { name: "/poke", description: "Chọc ai đó! 👉" },
      { name: "/cuddle", description: "Ôm ấp ai đó! 🧸" },
      { name: "/cry", description: "Thể hiện nỗi buồn... 😢" },
      { name: "/smile", description: "Mỉm cười! 😄" },
      { name: "/kill", description: "Hạ gục ai đó (đùa) 🔪" },
    ],
  },
  music: {
    title: "🎵 Lệnh âm nhạc",
    commands: [
      { name: "/play", description: "Phát bài hát hoặc playlist" },
      { name: "/pause", description: "Tạm dừng phát" },
      { name: "/resume", description: "Tiếp tục phát" },
      { name: "/skip", description: "Bỏ qua bài hiện tại" },
      { name: "/shuffle", description: "Xáo trộn danh sách" },
      { name: "/stop", description: "Dừng phát và xóa danh sách" },
      { name: "/queue", description: "Xem hàng đợi hiện tại" },
      { name: "/nowplaying", description: "Hiển thị bài đang phát" },
      { name: "/volume", description: "Điều chỉnh âm lượng" },
    ],
  },
  utility: {
    title: "🔧 Lệnh tiện ích",
    commands: [
      { name: "/ping", description: "Kiểm tra độ trễ bot" },
      { name: "/status", description: "Xem trạng thái và thống kê bot" },
      { name: "/help", description: "Hiển thị menu trợ giúp" },
      { name: "/serverinfo", description: "Xem thông tin máy chủ" },
      { name: "/userinfo", description: "Xem thông tin người dùng" },
      { name: "/avatar", description: "Hiển thị avatar người dùng" },
      { name: "/stayvc", description: "Giữ bot trong kênh voice" },
    ],
  },
};

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands"),

  async execute(interaction) {
    const embed = customEmbed({
      title: "📚 MeoMeo Bot - Trợ giúp",
      description: "Chọn danh mục bên dưới để xem lệnh",
      color: config.colors.primary,
      fields: [
        {
          name: "🛡️ Quản trị",
          value: "Lệnh quản trị máy chủ",
          inline: true,
        },
        { name: "📊 Cấp độ", value: "Lệnh xếp hạng voice", inline: true },
        { name: "🎮 Giải trí", value: "Lệnh giải trí", inline: true },
        { name: "🎭 Hành động", value: "Lệnh tương tác", inline: true },
        { name: "🎵 Âm nhạc", value: "Trình phát nhạc YouTube", inline: true },
        { name: "🔧 Tiện ích", value: "Lệnh thông tin", inline: true },
      ],
    });

    const menu = selectMenus.helpCategory();

    const message = await interaction.reply({
      embeds: [embed],
      components: [menu],
      fetchReply: true,
    });

    // Collector for category selection
    const menuInteraction = await awaitSelectMenu(
      message,
      interaction.user.id,
      60,
    );

    if (!menuInteraction) {
      await handleTimeout(message);
      return;
    }

    const category = menuInteraction.values[0];
    const categoryData = commandCategories[category];

    const categoryEmbed = customEmbed({
      title: categoryData.title,
      description: "Các lệnh trong danh mục này:",
      color: config.colors.primary,
      fields: categoryData.commands.map((cmd) => ({
        name: cmd.name,
        value: cmd.description,
      })),
    });

    await menuInteraction.update({
      embeds: [categoryEmbed],
      components: [],
    });
  },
};
