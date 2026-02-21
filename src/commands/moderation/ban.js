import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { successEmbed, errorEmbed } from "../../utils/embed.js";
import modals from "../../components/modals.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to ban")
        .setRequired(true),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const member = await interaction.guild.members
      .fetch(target.id)
      .catch(() => null);

    // Check if member exists and can be banned
    if (member) {
      if (!member.bannable) {
        return interaction.reply({
          embeds: [
            errorEmbed("Không thể cấm", "Mình không có quyền cấm người này."),
          ],
          ephemeral: true,
        });
      }

      if (
        member.roles.highest.position >=
        interaction.member.roles.highest.position
      ) {
        return interaction.reply({
          embeds: [
            errorEmbed(
              "Không thể cấm",
              "Bạn không thể cấm người này do thứ bậc role.",
            ),
          ],
          ephemeral: true,
        });
      }
    }

    // Show modal for ban reason
    const modal = modals.ban();
    await interaction.showModal(modal);

    // Wait for modal submission
    const submitted = await interaction
      .awaitModalSubmit({
        filter: (i) =>
          i.customId === "ban_modal" && i.user.id === interaction.user.id,
        time: 120000,
      })
      .catch(() => null);

    if (!submitted) return;

    const reason = submitted.fields.getTextInputValue("ban_reason");
    const deleteDays = parseInt(
      submitted.fields.getTextInputValue("delete_messages_days") || "0",
    );

    // Validate delete days
    const deleteMessageDays = Math.min(Math.max(0, deleteDays), 7);

    // Perform ban
    try {
      await interaction.guild.members.ban(target.id, {
        reason: reason,
        deleteMessageDays: deleteMessageDays,
      });

      await submitted.reply({
        embeds: [
          successEmbed(
            "Đã cấm thành viên",
            `${target.tag} đã bị cấm khỏi máy chủ.\n**Lý do:** ${reason}\n**Tin nhắn đã xóa:** ${deleteMessageDays} ngày gần nhất`,
          ),
        ],
        ephemeral: true,
      });
    } catch (error) {
      await submitted.reply({
        embeds: [
          errorEmbed("Lỗi", "Không thể cấm người dùng: " + error.message),
        ],
        ephemeral: true,
      });
    }
  },
};
