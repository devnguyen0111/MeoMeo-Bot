import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import { successEmbed, errorEmbed } from "../../utils/embed.js";

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
    const reason = interaction.options.getString("reason") || `Được thay đổi bởi ${interaction.user.tag}`;

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        embeds: [errorEmbed("Lỗi", "Không tìm thấy thành viên này trong máy chủ.")],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if bot has ManageNicknames permission
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.reply({
        embeds: [errorEmbed("Thiếu quyền", "Mình không có quyền quản lý biệt danh trong máy chủ này.")],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if target is the server owner
    if (member.id === interaction.guild.ownerId) {
      return interaction.reply({
        embeds: [errorEmbed("Không thể đổi biệt danh", "Không thể thay đổi biệt danh của chủ sở hữu máy chủ.")],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if target is manageable by bot
    if (!member.manageable) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            "Không thể đổi biệt danh",
            "Mình không có quyền chỉnh sửa thành viên này (có thể do thứ bậc vai trò cao hơn bot).",
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check role hierarchy for the interaction member (except if editing themselves or owner is executing)
    if (
      member.id !== interaction.user.id &&
      member.roles.highest.position >= interaction.member.roles.highest.position &&
      interaction.user.id !== interaction.guild.ownerId
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            "Không thể đổi biệt danh",
            "Bạn không thể đổi biệt danh của thành viên này do thứ bậc vai trò của họ cao hơn hoặc bằng bạn.",
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const oldNickname = member.displayName;
      await member.setNickname(nickname, reason);

      const actionText = nickname
        ? `đã đổi biệt danh của **${target.tag}** từ **${oldNickname}** thành **${nickname}**`
        : `đã xóa biệt danh của **${target.tag}** (trước đó là **${oldNickname}**)`;

      await interaction.reply({
        embeds: [
          successEmbed(
            "Thay đổi biệt danh thành công",
            `${actionText}.\n**Lý do:** ${reason}`
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        embeds: [errorEmbed("Lỗi", "Không thể thay đổi biệt danh: " + error.message)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
