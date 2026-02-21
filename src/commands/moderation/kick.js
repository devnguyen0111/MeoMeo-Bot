import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { customEmbed, successEmbed, errorEmbed } from "../../utils/embed.js";
import buttons from "../../components/buttons.js";
import { awaitButton } from "../../utils/collectors.js";
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

    // Check if user can be kicked
    if (!member.kickable) {
      return interaction.reply({
        embeds: [
          errorEmbed("Không thể kick", "Mình không có quyền kick người này."),
        ],
        ephemeral: true,
      });
    }

    // Check role hierarchy
    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            "Không thể kick",
            "Bạn không thể kick người này do thứ bậc role.",
          ),
        ],
        ephemeral: true,
      });
    }

    // Confirmation prompt
    const confirmEmbed = customEmbed({
      title: "⚠️ Xác nhận kick",
      description: `Bạn chắc muốn kick ${target.tag}?`,
      color: config.colors.warning,
      fields: [
        { name: "Người dùng", value: target.toString(), inline: true },
        { name: "Lý do", value: reason, inline: true },
      ],
      thumbnail: target.displayAvatarURL(),
    });

    const confirmButtons = buttons.confirmation("kick");

    const message = await interaction.reply({
      embeds: [confirmEmbed],
      components: [confirmButtons],
      fetchReply: true,
      ephemeral: true,
    });

    const buttonInteraction = await awaitButton(
      message,
      interaction.user.id,
      30,
    );

    if (!buttonInteraction) {
      return interaction.editReply({
        embeds: [errorEmbed("Hết thời gian", "Đã hủy kick vì hết thời gian.")],
        components: [],
      });
    }

    if (buttonInteraction.customId === "kick_no") {
      return buttonInteraction.update({
        embeds: [errorEmbed("Đã hủy", "Đã hủy kick.")],
        components: [],
      });
    }

    // Perform kick
    try {
      await member.kick(reason);

      await buttonInteraction.update({
        embeds: [
          successEmbed(
            "Đã kick thành viên",
            `${target.tag} đã bị kick khỏi máy chủ.\n**Lý do:** ${reason}`,
          ),
        ],
        components: [],
      });
    } catch (error) {
      await buttonInteraction.update({
        embeds: [
          errorEmbed("Lỗi", "Không thể kick người dùng: " + error.message),
        ],
        components: [],
      });
    }
  },
};
