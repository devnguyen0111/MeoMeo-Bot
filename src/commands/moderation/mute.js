import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { successEmbed, errorEmbed } from "../../utils/embed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to timeout")
        .setRequired(true),
    )
    .addIntegerOption(
      (option) =>
        option
          .setName("duration")
          .setDescription("Timeout duration in minutes")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(40320), // 28 days max
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for timeout")
        .setRequired(false),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration");
    const reason = interaction.options.getString("reason") || "Không có lý do";
    const member = await interaction.guild.members.fetch(target.id);

    // Check if user can be timed out
    if (!member.moderatable) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            "Không thể timeout",
            "Mình không có quyền timeout người này.",
          ),
        ],
        ephemeral: true,
      });
    }

    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            "Không thể timeout",
            "Bạn không thể timeout người này do thứ bậc role.",
          ),
        ],
        ephemeral: true,
      });
    }

    // Perform timeout
    try {
      await member.timeout(duration * 60 * 1000, reason);

      await interaction.reply({
        embeds: [
          successEmbed(
            "Đã timeout thành viên",
            `${target.tag} đã bị timeout ${duration} phút.\n**Lý do:** ${reason}`,
          ),
        ],
        ephemeral: true,
      });
    } catch (error) {
      await interaction.reply({
        embeds: [
          errorEmbed("Lỗi", "Không thể timeout người dùng: " + error.message),
        ],
        ephemeral: true,
      });
    }
  },
};
