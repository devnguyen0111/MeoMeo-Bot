import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

/**
 * Help command category selector
 */
export function helpCategoryMenu() {
  const options = [
    new StringSelectMenuOptionBuilder()
      .setLabel("🛡️ Quản trị")
      .setDescription("Lệnh quản trị máy chủ")
      .setValue("moderation"),
    new StringSelectMenuOptionBuilder()
      .setLabel("📊 Cấp độ")
      .setDescription("Lệnh cấp độ và xếp hạng voice")
      .setValue("leveling"),
    new StringSelectMenuOptionBuilder()
      .setLabel("🎮 Giải trí")
      .setDescription("Lệnh giải trí")
      .setValue("fun"),
    new StringSelectMenuOptionBuilder()
      .setLabel("🎭 Hành động")
      .setDescription("Lệnh tương tác xã hội")
      .setValue("actions"),
    new StringSelectMenuOptionBuilder()
      .setLabel("🔧 Tiện ích")
      .setDescription("Lệnh tiện ích và thông tin")
      .setValue("utility"),
  ];

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("help_category")
    .setPlaceholder("Chọn danh mục để xem lệnh")
    .addOptions(options);

  return new ActionRowBuilder().addComponents(selectMenu);
}

/**
 * Generic select menu builder
 */
export function customSelectMenu(customId, placeholder, options) {
  const menuOptions = options.map((opt) => {
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(opt.label)
      .setValue(opt.value);

    if (opt.description) option.setDescription(opt.description);
    if (opt.emoji) option.setEmoji(opt.emoji);
    if (opt.default) option.setDefault(true);

    return option;
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .addOptions(menuOptions);

  return new ActionRowBuilder().addComponents(selectMenu);
}

/**
 * Time duration selector
 */
export function timeDurationMenu(customId = "time_duration") {
  const options = [
    new StringSelectMenuOptionBuilder().setLabel("1 phút").setValue("60"),
    new StringSelectMenuOptionBuilder().setLabel("5 phút").setValue("300"),
    new StringSelectMenuOptionBuilder().setLabel("10 phút").setValue("600"),
    new StringSelectMenuOptionBuilder().setLabel("30 phút").setValue("1800"),
    new StringSelectMenuOptionBuilder().setLabel("1 giờ").setValue("3600"),
    new StringSelectMenuOptionBuilder().setLabel("1 ngày").setValue("86400"),
  ];

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder("Chọn thời lượng timeout")
    .addOptions(options);

  return new ActionRowBuilder().addComponents(selectMenu);
}

export default {
  helpCategory: helpCategoryMenu,
  custom: customSelectMenu,
  timeDuration: timeDurationMenu,
};
