import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { successEmbed, errorEmbed } from "../../utils/embed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Bulk delete messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);

      await interaction.reply({
        embeds: [
          successEmbed(
            "Đã xóa tin nhắn",
            `Đã xóa thành công ${deleted.size} tin nhắn.`,
          ),
        ],
        ephemeral: true,
      });
    } catch (error) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            "Lỗi",
            "Không thể xóa tin nhắn. Có thể chúng đã cũ hơn 14 ngày.",
          ),
        ],
        ephemeral: true,
      });
    }
  },
};
