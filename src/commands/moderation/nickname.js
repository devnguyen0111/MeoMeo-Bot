import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import {
  errorContainer,
  successContainer,
  v2Payload,
} from "../../utils/componentsV2.js";

export default {
  data: new SlashCommandBuilder()
    .setName("nickname")
    .setDescription("Thay đổi biệt danh của một thành viên trong máy chủ")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Thành viên cần thay đổi biệt danh")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("Biệt danh mới (để trống để xóa biệt danh hiện tại)")
        .setRequired(false)
        .setMaxLength(32),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Lý do thay đổi biệt danh")
        .setRequired(false),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const nickname = interaction.options.getString("nickname");
    const reason =
      interaction.options.getString("reason") ||
      `Được thay đổi bởi ${interaction.user.tag}`;

    const member = await interaction.guild.members
      .fetch(target.id)
      .catch(() => null);

    if (!member) {
      return interaction.reply(
        v2Payload(
          errorContainer("Lỗi", "Không tìm thấy thành viên này trong máy chủ."),
          { ephemeral: true },
        ),
      );
    }

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ManageNicknames,
      )
    ) {
      return interaction.reply(
        v2Payload(
          errorContainer(
            "Thiếu quyền",
            "Mình không có quyền quản lý biệt danh trong máy chủ này.",
          ),
          { ephemeral: true },
        ),
      );
    }

    if (member.id === interaction.guild.ownerId) {
      return interaction.reply(
        v2Payload(
          errorContainer(
            "Không thể đổi biệt danh",
            "Không thể thay đổi biệt danh của chủ sở hữu máy chủ.",
          ),
          { ephemeral: true },
        ),
      );
    }

    if (!member.manageable) {
      return interaction.reply(
        v2Payload(
          errorContainer(
            "Không thể đổi biệt danh",
            "Mình không có quyền chỉnh sửa thành viên này (có thể do thứ bậc vai trò cao hơn bot).",
          ),
          { ephemeral: true },
        ),
      );
    }

    if (
      member.id !== interaction.user.id &&
      member.roles.highest.position >=
        interaction.member.roles.highest.position &&
      interaction.user.id !== interaction.guild.ownerId
    ) {
      return interaction.reply(
        v2Payload(
          errorContainer(
            "Không thể đổi biệt danh",
            "Bạn không thể đổi biệt danh của thành viên này do thứ bậc vai trò của họ cao hơn hoặc bằng bạn.",
          ),
          { ephemeral: true },
        ),
      );
    }

    try {
      const oldNickname = member.displayName;
      await member.setNickname(nickname, reason);

      const actionText = nickname
        ? `đã đổi biệt danh của **${target.tag}** từ **${oldNickname}** thành **${nickname}**`
        : `đã xóa biệt danh của **${target.tag}** (trước đó là **${oldNickname}**)`;

      await interaction.reply(
        v2Payload(
          successContainer(
            "Thay đổi biệt danh thành công",
            `${actionText}.\n**Lý do:** ${reason}`,
          ),
          { ephemeral: true },
        ),
      );
    } catch (error) {
      await interaction.reply(
        v2Payload(
          errorContainer("Lỗi", "Không thể thay đổi biệt danh: " + error.message),
          { ephemeral: true },
        ),
      );
    }
  },
};
