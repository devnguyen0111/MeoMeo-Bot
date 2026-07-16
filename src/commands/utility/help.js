import { SlashCommandBuilder } from "discord.js";
import selectMenus from "../../components/selectMenus.js";
import { awaitSelectMenu, handleTimeout } from "../../utils/collectors.js";
import { cardContainer, v2Payload } from "../../utils/componentsV2.js";
import config from "../../../config/config.js";

const commandCategories = {
  moderation: {
    title: "🛡️ Lệnh quản trị",
    commands: [
      { name: "/kick", description: "Kick một thành viên khỏi máy chủ" },
      { name: "/ban", description: "Cấm một thành viên khỏi máy chủ" },
      { name: "/mute", description: "Timeout một thành viên" },
      { name: "/clear", description: "Xóa hàng loạt tin nhắn" },
      { name: "/nickname", description: "Đổi hoặc xóa biệt danh thành viên" },
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
  utility: {
    title: "🔧 Lệnh tiện ích",
    commands: [
      { name: "/ping", description: "Kiểm tra độ trễ bot" },
      { name: "/status", description: "Xem trạng thái và thống kê bot" },
      { name: "/help", description: "Hiển thị menu trợ giúp" },
      { name: "/serverinfo", description: "Xem thông tin máy chủ" },
      { name: "/userinfo", description: "Xem thông tin người dùng" },
      { name: "/avatar", description: "Hiển thị avatar người dùng" },
    ],
  },
};

function buildHelpContainer(title, description, fields = [], rows = []) {
  return cardContainer({
    title,
    description,
    color: config.colors.primary,
    fields,
    rows,
  });
}

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands"),

  async execute(interaction) {
    const menu = selectMenus.helpCategory();
    const container = buildHelpContainer(
      "📚 MeoMeo Bot - Trợ giúp",
      "Chọn danh mục bên dưới để xem lệnh",
      [
        { name: "🛡️ Quản trị", value: "Lệnh quản trị máy chủ", inline: true },
        { name: "📊 Cấp độ", value: "Lệnh xếp hạng voice", inline: true },
        { name: "🎮 Giải trí", value: "Lệnh giải trí", inline: true },
        { name: "🎭 Hành động", value: "Lệnh tương tác", inline: true },
        { name: "🔧 Tiện ích", value: "Lệnh thông tin", inline: true },
      ],
      [menu],
    );

    const message = await interaction.reply({
      ...v2Payload(container),
      fetchReply: true,
    });

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
    const categoryContainer = buildHelpContainer(
      categoryData.title,
      "Các lệnh trong danh mục này:",
      categoryData.commands.map((cmd) => ({
        name: cmd.name,
        value: cmd.description,
      })),
    );

    await menuInteraction.update(v2Payload(categoryContainer));
  },
};
