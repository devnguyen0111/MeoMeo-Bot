import { SlashCommandBuilder } from "discord.js";
import { QueryType } from "discord-player";
import { successEmbed, errorEmbed } from "../../utils/embed.js";
import logger from "../../utils/logger.js";
import config from "../../../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music from YouTube or search query")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Song name or URL")
        .setRequired(true),
    ),

  async execute(interaction) {
    const query = interaction.options.getString("query", true);
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      await interaction.reply({
        embeds: [errorEmbed("No Voice Channel", "Join a voice channel first.")],
        ephemeral: true,
      });
      return;
    }

    const player = interaction.client.player;
    if (!player) {
      await interaction.reply({
        embeds: [errorEmbed("Music Unavailable", "Music system is not ready.")],
        ephemeral: true,
      });
      return;
    }

    const existingQueue = player.nodes.get(interaction.guild.id);
    if (
      existingQueue?.channel &&
      existingQueue.channel.id !== voiceChannel.id
    ) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            "Already Playing",
            "I am already playing in another voice channel.",
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    const isUrl = /^https?:\/\//i.test(query);
    const searchEngines = [];

    if (isUrl) {
      if (/([?&]list=)/i.test(query)) {
        searchEngines.push(QueryType.YOUTUBE_PLAYLIST, QueryType.AUTO);
      } else if (/(youtube\.com\/watch|youtu\.be\/)/i.test(query)) {
        searchEngines.push(QueryType.YOUTUBE_VIDEO, QueryType.AUTO);
      } else {
        searchEngines.push(QueryType.AUTO);
      }
    } else {
      searchEngines.push(QueryType.AUTO, QueryType.YOUTUBE_SEARCH);
    }

    let searchResult = null;
    let lastError = null;

    for (const engine of searchEngines) {
      try {
        const result = await player.search(query, {
          requestedBy: interaction.user,
          searchEngine: engine,
        });

        if (result?.tracks?.length) {
          searchResult = result;
          break;
        }

        searchResult = result;
      } catch (error) {
        lastError = error;
      }
    }

    if (!searchResult?.tracks?.length) {
      if (lastError) {
        logger.error("Search failed:", lastError);
      } else {
        logger.warn(`No results for query: ${query}`);
      }
      await interaction.editReply({
        embeds: [errorEmbed("No Results", "I could not find any matches.")],
      });
      return;
    }

    const queue = player.nodes.create(interaction.guild, {
      metadata: {
        channel: interaction.channel,
        requestedBy: interaction.user,
      },
      selfDeaf: true,
      volume: config.music.defaultVolume,
      leaveOnEnd: false,
      leaveOnEndCooldown: config.music.leaveOnEndCooldown,
      leaveOnEmpty: false,
      leaveOnEmptyCooldown: config.music.leaveOnEmptyCooldown,
      leaveOnStop: false,
      leaveOnStopCooldown: config.music.leaveOnStopCooldown,
    });

    const hadExistingQueue =
      Boolean(queue.currentTrack) || queue.tracks.size > 0;
    queue.metadata = {
      channel: interaction.channel,
      requestedBy: interaction.user,
    };

    try {
      if (!queue.connection) {
        await queue.connect(voiceChannel);
      }
    } catch (error) {
      queue.delete();
      await interaction.editReply({
        embeds: [
          errorEmbed(
            "Connection Failed",
            "I could not join the voice channel.",
          ),
        ],
      });
      return;
    }

    const isPlaylist = Boolean(searchResult.playlist);
    const tracksToAdd = isPlaylist
      ? searchResult.tracks
      : [searchResult.tracks[0]];

    queue.addTrack(tracksToAdd);

    if (!queue.node.isPlaying()) {
      try {
        await queue.node.play();
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (queue.node.isPlaying()) {
          return;
        }

        if (!hadExistingQueue) {
          queue.tracks.clear();
        }
        await interaction.editReply({
          embeds: [
            errorEmbed(
              "Playback Failed",
              "I could not play this track. Please try another song.",
            ),
          ],
        });
        return;
      }
    }

    if (isPlaylist) {
      await interaction.editReply({
        embeds: [
          successEmbed(
            "Playlist Queued",
            `Added **${searchResult.playlist.title}** with **${searchResult.tracks.length}** tracks.`,
          ),
        ],
      });
      return;
    }

    const track = searchResult.tracks[0];
    await interaction.editReply({
      embeds: [
        successEmbed("Track Queued", `Added **${track.title}** to the queue.`),
      ],
    });
  },
};
