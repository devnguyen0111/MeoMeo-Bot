import {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import {
  joinVoiceChannel,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { infoEmbed, successEmbed, errorEmbed } from "../../utils/embed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stayvc")
    .setDescription("Keep the bot in a voice channel")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("join")
        .setDescription("Join your current voice channel"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leave")
        .setDescription("Leave the current voice channel"),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "leave") {
      const connection = getVoiceConnection(interaction.guildId);
      if (!connection) {
        await interaction.reply({
          embeds: [infoEmbed("Không ở voice", "Mình không ở kênh voice.")],
          ephemeral: true,
        });
        return;
      }

      connection.destroy();
      await interaction.reply({
        embeds: [successEmbed("Đã rời voice", "Đã rời kênh voice.")],
        ephemeral: true,
      });
      return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const channel = member?.voice?.channel;

    if (!channel) {
      await interaction.reply({
        embeds: [
          errorEmbed("Không có kênh voice", "Vui lòng vào kênh voice trước."),
        ],
        ephemeral: true,
      });
      return;
    }

    if (
      channel.type !== ChannelType.GuildVoice &&
      channel.type !== ChannelType.GuildStageVoice
    ) {
      await interaction.reply({
        embeds: [errorEmbed("Kênh không hợp lệ", "Vui lòng dùng kênh voice.")],
        ephemeral: true,
      });
      return;
    }

    const me = await interaction.guild.members.fetchMe();
    const permissions = channel.permissionsFor(me);

    if (!permissions?.has(PermissionFlagsBits.Connect)) {
      await interaction.reply({
        embeds: [errorEmbed("Thiếu quyền", "Mình cần quyền Connect.")],
        ephemeral: true,
      });
      return;
    }

    const existing = getVoiceConnection(interaction.guildId);
    if (existing?.joinConfig?.channelId === channel.id) {
      await interaction.reply({
        embeds: [infoEmbed("Đã kết nối", `Mình đã ở **${channel.name}** rồi.`)],
        ephemeral: true,
      });
      return;
    }

    if (existing) {
      existing.destroy();
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
    });

    try {
      // Wait for connection ready to avoid short-lived joins.
      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

      await interaction.reply({
        embeds: [
          successEmbed("Đang ở lại voice", `Đã vào **${channel.name}**.`),
        ],
        ephemeral: true,
      });
    } catch (error) {
      connection.destroy();
      await interaction.reply({
        embeds: [errorEmbed("Không thể vào", "Mình không thể vào kênh đó.")],
        ephemeral: true,
      });
    }
  },
};
