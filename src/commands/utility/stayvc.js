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
import {
  errorContainer,
  infoContainer,
  successContainer,
  v2Payload,
} from "../../utils/componentsV2.js";

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
        await interaction.reply(
          v2Payload(infoContainer("Không ở voice", "Mình không ở kênh voice."), {
            ephemeral: true,
          }),
        );
        return;
      }

      connection.destroy();
      await interaction.reply(
        v2Payload(successContainer("Đã rời voice", "Đã rời kênh voice."), {
          ephemeral: true,
        }),
      );
      return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const channel = member?.voice?.channel;

    if (!channel) {
      await interaction.reply(
        v2Payload(
          errorContainer("Không có kênh voice", "Vui lòng vào kênh voice trước."),
          { ephemeral: true },
        ),
      );
      return;
    }

    if (
      channel.type !== ChannelType.GuildVoice &&
      channel.type !== ChannelType.GuildStageVoice
    ) {
      await interaction.reply(
        v2Payload(
          errorContainer("Kênh không hợp lệ", "Vui lòng dùng kênh voice."),
          { ephemeral: true },
        ),
      );
      return;
    }

    const me = await interaction.guild.members.fetchMe();
    const permissions = channel.permissionsFor(me);

    if (!permissions?.has(PermissionFlagsBits.Connect)) {
      await interaction.reply(
        v2Payload(errorContainer("Thiếu quyền", "Mình cần quyền Connect."), {
          ephemeral: true,
        }),
      );
      return;
    }

    const existing = getVoiceConnection(interaction.guildId);
    if (existing?.joinConfig?.channelId === channel.id) {
      await interaction.reply(
        v2Payload(
          infoContainer("Đã kết nối", `Mình đã ở **${channel.name}** rồi.`),
          { ephemeral: true },
        ),
      );
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
      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

      await interaction.reply(
        v2Payload(
          successContainer("Đang ở lại voice", `Đã vào **${channel.name}**.`),
          { ephemeral: true },
        ),
      );
    } catch (error) {
      connection.destroy();
      await interaction.reply(
        v2Payload(
          errorContainer("Không thể vào", "Mình không thể vào kênh đó."),
          { ephemeral: true },
        ),
      );
    }
  },
};
