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
          embeds: [infoEmbed("Not in voice", "I'm not in a voice channel.")],
          ephemeral: true,
        });
        return;
      }

      connection.destroy();
      await interaction.reply({
        embeds: [
          successEmbed("Left voice", "Disconnected from the voice channel."),
        ],
        ephemeral: true,
      });
      return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const channel = member?.voice?.channel;

    if (!channel) {
      await interaction.reply({
        embeds: [
          errorEmbed("No voice channel", "Please join a voice channel first."),
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
        embeds: [errorEmbed("Invalid channel", "Please use a voice channel.")],
        ephemeral: true,
      });
      return;
    }

    const me = await interaction.guild.members.fetchMe();
    const permissions = channel.permissionsFor(me);

    if (!permissions?.has(PermissionFlagsBits.Connect)) {
      await interaction.reply({
        embeds: [
          errorEmbed("Missing permissions", "I need Connect permission."),
        ],
        ephemeral: true,
      });
      return;
    }

    const existing = getVoiceConnection(interaction.guildId);
    if (existing?.joinConfig?.channelId === channel.id) {
      await interaction.reply({
        embeds: [
          infoEmbed("Already connected", `I'm already in **${channel.name}**.`),
        ],
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
          successEmbed("Staying in voice", `Joined **${channel.name}**.`),
        ],
        ephemeral: true,
      });
    } catch (error) {
      connection.destroy();
      await interaction.reply({
        embeds: [
          errorEmbed("Failed to join", "I couldn't connect to that channel."),
        ],
        ephemeral: true,
      });
    }
  },
};
