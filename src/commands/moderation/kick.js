import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import buttons from "../../components/buttons.js";
import { awaitButton } from "../../utils/collectors.js";
import {
  cardContainer,
  errorContainer,
  successContainer,
  v2Payload,
} from "../../utils/componentsV2.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for kick")
        .setRequired(false),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "Không có lý do";
    const member = await interaction.guild.members.fetch(target.id);

    if (!member.kickable) {
      return interaction.reply(
        v2Payload(
          errorContainer("Không thể kick", "Mình không có quyền kick người này."),
          { ephemeral: true },
        ),
      );
    }

    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply(
        v2Payload(
          errorContainer(
            "Không thể kick",
            "Bạn không thể kick người này do thứ bậc role.",
          ),
          { ephemeral: true },
        ),
      );
    }

    const confirmContainer = cardContainer({
      title: "⚠️ Xác nhận kick",
      description: `Bạn chắc muốn kick ${target.tag}?`,
      color: config.colors.warning,
      thumbnailUrl: target.displayAvatarURL(),
      fields: [
        { name: "Người dùng", value: target.toString(), inline: true },
        { name: "Lý do", value: reason, inline: true },
      ],
      rows: [buttons.confirmation("kick")],
    });

    const message = await interaction.reply({
      ...v2Payload(confirmContainer, { ephemeral: true }),
      fetchReply: true,
    });

    const buttonInteraction = await awaitButton(
      message,
      interaction.user.id,
      30,
    );

    if (!buttonInteraction) {
      return interaction.editReply(
        v2Payload(
          errorContainer("Hết thời gian", "Đã hủy kick vì hết thời gian."),
        ),
      );
    }

    if (buttonInteraction.customId === "kick_no") {
      return buttonInteraction.update(
        v2Payload(errorContainer("Đã hủy", "Đã hủy kick.")),
      );
    }

    try {
      await member.kick(reason);

      await buttonInteraction.update(
        v2Payload(
          successContainer(
            "Đã kick thành viên",
            `${target.tag} đã bị kick khỏi máy chủ.\n**Lý do:** ${reason}`,
          ),
        ),
      );
    } catch (error) {
      await buttonInteraction.update(
        v2Payload(
          errorContainer("Lỗi", "Không thể kick người dùng: " + error.message),
        ),
      );
    }
  },
};
