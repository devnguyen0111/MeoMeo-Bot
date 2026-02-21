import { EmbedBuilder } from "discord.js";
import config from "../../config/config.js";

const ACTION_TEMPLATES = {
  kiss: [
    "{user} hôn {target}! 😘",
    "{user} trao {target} một nụ hôn thật to! 💋",
    "{user} bất ngờ hôn trộm {target}! 😳",
    "{user} hôn lên má {target}! 😽",
    "{user} nghiêng người hôn {target}! 💖",
    "Mwah! {user} hôn {target}! 💋",
    "{user} hôn {target} thật nồng nàn! 🌹",
    "{user} hôn lên trán {target}! ✨",
    "{user} tặng {target} cả rổ nụ hôn! 😍",
    "{target} nhận nụ hôn bất ngờ từ {user}! 🎁",
  ],
  hug: [
    "{user} ôm {target}! 🤗",
    "{user} ôm {target} thật ấm áp! 💖",
    "{user} ôm siết {target}! 🫂",
    "{user} ôm chặt {target}! ✨",
    "{user} ôm gấu {target}! 🐻",
    "{user} vòng tay ôm lấy {target}! 💝",
    "{user} lao tới ôm {target}! 💥",
    "{user} không muốn buông {target}! 🔒",
    "{user} kéo {target} vào một cái ôm dịu dàng! 🌸",
    "{target} nhận một cái ôm thật to từ {user}! 💫",
  ],
  pat: [
    "{user} xoa đầu {target}! 💆",
    "{user} nhẹ nhàng xoa đầu {target}! ✨",
    "{user} vỗ về {target} bằng cái xoa đầu! 🌸",
    "*pat pat* {user} xoa đầu {target}! 🖐️",
    "{user} vuốt ve {target} như một chú mèo ngoan! 🐱",
    "{user} xoa rối tóc {target}! 💇",
    "{user} tặng {target} vài cái xoa đầu! 💖",
    "Ngoan nào... {user} xoa đầu {target}! 🍵",
    "{user} thấy {target} xứng đáng được xoa đầu! ⭐",
    "{user} xoa đầu {target} thật trìu mến! 🥰",
  ],
  slap: [
    "{user} tát {target}! 👋",
    "{user} cho {target} một cái tát! 💢",
    "{user} tát {target} một cái! 😤",
    "Ối! {user} tát {target}! 💫",
    "Bốp! {user} tát {target}! 💥",
    "{user} tát thẳng mặt {target}! 😱",
    "{user} quyết định {target} cần một cái tát! 🤚",
    "{target} cảm nhận cú tát từ {user}! 🔥",
    "Ăn này! {user} tát {target}! ⚡",
    "{user} tát {target} cho tỉnh! 🧠",
  ],
  poke: [
    "{user} chọc {target}! 👉",
    "{user} chọc {target} một cái! 👆",
    "{user} chạm nhẹ {target}! 🐽",
    "Này! {user} chọc {target}! 💢",
    "{user} trêu {target} bằng mấy cú chọc! 🌀",
    "{user} chọc má {target}! 😛",
    "{user} muốn {target} chú ý! 👉",
    "Chọc chọc! {user} làm phiền {target}! 🔔",
    "{user} lén chọc {target}! 🕵️",
    "{target} bị {user} chọc! 🎯",
  ],
  cuddle: [
    "{user} ôm ấp {target}! 🧸",
    "{user} rúc vào {target}! 💤",
    "{user} ôm {target} thật sát! 💖",
    "{target} đang được {user} ôm ấp! ✨",
    "{user} muốn ôm ấp {target}! 🥰",
    "{user} và {target} đang ôm ấp nhau! 🌸",
    "{user} nằm ôm {target}! 🥄",
    "{user} giữ ấm {target} bằng một cái ôm! 🔥",
    "{user} vùi mặt vào {target} khi ôm ấp! 🙈",
    "Đến giờ ôm ấp của {user} và {target}! ⏰",
  ],
  kill: [
    "{user} hạ gục {target}! 🔪",
    "{user} tiễn {target}! 💀",
    "{user} kết liễu {target}! 🩸",
    "R.I.P {target}, bị {user} hạ gục... 🪦",
    "{user} ám sát {target}! 🥷",
    "{user} quyết định {target} phải đi... ⚰️",
    "{user} chấm dứt {target}! 🚫",
    "{target} bị {user} hạ đo ván! 🔫",
    "{user} gây án với {target}! 🚔",
    "Fatality! {user} hạ gục {target}! 🧱",
  ],

  // Solo actions
  cry: [
    "{user} đang khóc... 😢",
    "{user} bật khóc nức nở! 😭",
    "{user} rơi nước mắt... 💧",
    "Ai đó an ủi {user} đi, đang khóc rồi... 😿",
    "{user} có một ngày tồi tệ... 🌧️",
    "{user} không thể ngừng khóc! 🌊",
    "{user} cần một cái ôm... 💔",
    "Nước mắt lăn dài trên má {user}... ☔",
    "{user} khóc nức nở không ngừng! 🤧",
    "Sao {user} lại khóc? :(",
  ],
  smile: [
    "{user} đang mỉm cười! 😄",
    "{user} nở nụ cười rạng rỡ! ✨",
    "{user} trông thật vui! 💖",
    "{user} cười tươi hết cỡ! 😁",
    "{user} cười toe toét! 😃",
    "Nụ cười của {user} làm sáng cả căn phòng! 💡",
    "{user} gửi một nụ cười tới mọi người! 💌",
    "{user} đang rất vui! 🎵",
    "{user} mỉm cười ấm áp! ☀️",
    "Cứ cười nhé {user}! 🌟",
  ],
};

const SELF_TEMPLATES = {
  kiss: "{user} định tự hôn mình... soi gương hả? 😳",
  hug: "{user} tự ôm mình... sẽ ổn thôi! 🫂",
  pat: "{user} tự xoa đầu. Giỏi lắm! 💆",
  slap: "{user} tự tát mình... vì sao? 🤨",
  poke: "{user} tự chọc mình. Có đau không? 👉",
  cuddle: "{user} ôm gối vì đang cô đơn... 🧸",
  kill: "{user} chọn con đường dễ... 💀",
};

/**
 * Fetch image from waifu.pics
 * @param {string} category
 * @param {string} type 'sfw' or 'nsfw'
 * @returns {Promise<string>} Image URL
 */
export async function getWaifuImage(category, type = "sfw") {
  try {
    const response = await fetch(`https://api.waifu.pics/${type}/${category}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error(`Waifu API Error (${category}):`, error);
    return null; // Return null on error
  }
}

/**
 * Handle generic anime interaction command
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {string} category Waifu.pics category
 * @param {string} actionVerb Deprecated - text is now looked up from templates
 * @param {boolean} targetsUser Whether the action targets another user (default true)
 */
export async function handleAnimeInteraction(
  interaction,
  category,
  actionVerb,
  targetsUser = true,
) {
  await interaction.deferReply();

  // Check for self-target prevention or silly responses could be added here
  const target = targetsUser ? interaction.options.getUser("user") : null;

  // Construct message
  let description;

  if (targetsUser && target) {
    // Self targeting special cases
    if (target.id === interaction.user.id) {
      description = SELF_TEMPLATES[category]
        ? SELF_TEMPLATES[category].replace(
            "{user}",
            `**${interaction.user.username}**`,
          )
        : `**${interaction.user.username}** ${actionVerb} chính mình! 😳`;
    } else {
      // Random template for action
      const templates = ACTION_TEMPLATES[category];
      if (templates && templates.length > 0) {
        const template =
          templates[Math.floor(Math.random() * templates.length)];
        description = template
          .replace("{user}", `**${interaction.user.username}**`)
          .replace("{target}", `**${target.username}**`);
      } else {
        // Fallback
        description = `**${interaction.user.username}** ${actionVerb} **${target.username}**!`;
      }
    }
  } else {
    // Solo action
    const templates = ACTION_TEMPLATES[category];
    if (templates && templates.length > 0) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      description = template.replace(
        "{user}",
        `**${interaction.user.username}**`,
      );
    } else {
      // Fallback
      description = `**${interaction.user.username}** ${actionVerb}!`;
    }
  }

  const imageUrl = await getWaifuImage(category, "sfw");

  const embed = new EmbedBuilder()
    .setDescription(description)
    .setColor(config.colors?.primary || 0x00ae86)
    .setImage(imageUrl)
    .setTimestamp();

  if (!imageUrl) {
    return interaction.editReply({
      content: "❌ Không lấy được ảnh. API có thể đang gặp sự cố.",
      ephemeral: true,
    });
  }

  await interaction.editReply({ embeds: [embed] });
}
