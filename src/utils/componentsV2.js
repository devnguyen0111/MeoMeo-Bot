import { ContainerBuilder, MessageFlags } from "discord.js";
import config from "../../config/config.js";

export { createProgressBar } from "./embed.js";

const STATUS_EMOJI = {
  success: config.emojis.success,
  error: config.emojis.error,
  warning: config.emojis.warning,
  info: "",
};

/**
 * Message flags for Components V2 payloads.
 */
export function v2Flags(ephemeral = false) {
  return ephemeral
    ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    : MessageFlags.IsComponentsV2;
}

/**
 * Build a standard V2 interaction payload.
 */
export function v2Payload(containers, { ephemeral = false } = {}) {
  const list = Array.isArray(containers) ? containers : [containers];
  return {
    components: list,
    flags: v2Flags(ephemeral),
  };
}

function statusContainer(type, title, description) {
  const emoji = STATUS_EMOJI[type];
  const heading = emoji ? `${emoji} ${title}` : title;

  return new ContainerBuilder()
    .setAccentColor(config.colors[type])
    .addTextDisplayComponents((td) =>
      td.setContent(`## ${heading}\n${description}`),
    );
}

export function successContainer(title, description) {
  return statusContainer("success", title, description);
}

export function errorContainer(title, description) {
  return statusContainer("error", title, description);
}

export function warningContainer(title, description) {
  return statusContainer("warning", title, description);
}

export function infoContainer(title, description) {
  return statusContainer("info", title, description);
}

function formatFields(fields = []) {
  const inlineFields = fields.filter((field) => field.inline);
  const blockFields = fields.filter((field) => !field.inline);
  const parts = [];

  if (inlineFields.length) {
    parts.push(
      inlineFields.map((field) => `**${field.name}** ${field.value}`).join(" • "),
    );
  }

  if (blockFields.length) {
    parts.push(
      blockFields
        .map((field) => `**${field.name}**\n${field.value}`)
        .join("\n\n"),
    );
  }

  return parts.join("\n\n");
}

/**
 * Nest ActionRowBuilder instances inside a container.
 */
export function addActionRows(container, ...rows) {
  for (const row of rows) {
    if (!row) continue;
    container.addActionRowComponents((actionRow) =>
      actionRow.setComponents(...row.components),
    );
  }
  return container;
}

/**
 * Flexible card layout for rank, info, leaderboard, etc.
 */
export function cardContainer({
  title,
  description,
  color = config.colors.primary,
  thumbnailUrl,
  imageUrl,
  fields = [],
  footer,
  rows = [],
}) {
  const container = new ContainerBuilder().setAccentColor(color);

  if (title || description) {
    let content = "";
    if (title) content += `## ${title}\n`;
    if (description) content += description;
    container.addTextDisplayComponents((td) => td.setContent(content.trim()));
  }

  if (fields.length > 0) {
    const fieldsContent = formatFields(fields);

    if (thumbnailUrl) {
      container.addSectionComponents((section) =>
        section
          .addTextDisplayComponents((td) => td.setContent(fieldsContent))
          .setThumbnailAccessory((thumb) => thumb.setURL(thumbnailUrl)),
      );
    } else {
      container.addTextDisplayComponents((td) => td.setContent(fieldsContent));
    }
  }

  if (imageUrl) {
    container.addMediaGalleryComponents((gallery) =>
      gallery.addItems((item) => item.setURL(imageUrl)),
    );
  }

  if (footer) {
    container
      .addSeparatorComponents((separator) => separator)
      .addTextDisplayComponents((td) => td.setContent(`*${footer}*`));
  }

  addActionRows(container, ...rows);
  return container;
}

/**
 * Image-focused V2 card (meme, waifu, avatar, nsfw).
 */
export function imageCardContainer({
  title,
  description,
  imageUrl,
  color = config.colors.primary,
  footer,
  rows = [],
}) {
  return cardContainer({
    title,
    description,
    color,
    imageUrl,
    footer,
    rows,
  });
}

export default {
  v2Flags,
  v2Payload,
  successContainer,
  errorContainer,
  warningContainer,
  infoContainer,
  cardContainer,
  imageCardContainer,
  addActionRows,
};
