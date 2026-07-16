import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import modals from "../../components/modals.js";
import {
  errorContainer,
  successContainer,
  v2Payload,
} from "../../utils/componentsV2.js";

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

    if (member) {
      if (!member.bannable) {
        return interaction.reply(
          v2Payload(
            errorContainer("Không thể cấm", "Mình không có quyền cấm người này."),
            { ephemeral: true },
          ),
        );
      }

      if (
        member.roles.highest.position >=
        interaction.member.roles.highest.position
      ) {
        return interaction.reply(
          v2Payload(
            errorContainer(
              "Không thể cấm",
              "Bạn không thể cấm người này do thứ bậc role.",
            ),
            { ephemeral: true },
          ),
        );
      }
    }

    const modal = modals.ban();
    await interaction.showModal(modal);

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
    const deleteMessageDays = Math.min(Math.max(0, deleteDays), 7);

    try {
      await interaction.guild.members.ban(target.id, {
        reason,
        deleteMessageDays,
      });

      await submitted.reply(
        v2Payload(
          successContainer(
            "Đã cấm thành viên",
            `${target.tag} đã bị cấm khỏi máy chủ.\n**Lý do:** ${reason}\n**Tin nhắn đã xóa:** ${deleteMessageDays} ngày gần nhất`,
          ),
          { ephemeral: true },
        ),
      );
    } catch (error) {
      await submitted.reply(
        v2Payload(
          errorContainer("Lỗi", "Không thể cấm người dùng: " + error.message),
          { ephemeral: true },
        ),
      );
    }
  },
};
