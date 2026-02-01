import { EmbedBuilder } from 'discord.js';
import config from '../../config/config.js';

const ACTION_TEMPLATES = {
    kiss: [
        "{user} kissed {target}! 😘",
        "{user} gave {target} a big kiss! 💋",
        "{user} steals a kiss from {target}! 😳",
        "{user} plants a kiss on {target}'s cheek! 😽",
        "{user} leans in and kisses {target}! 💖",
        "Mwah! {user} kisses {target}! 💋",
        "{user} gives {target} a passionate kiss! 🌹",
        "{user} kisses {target} on the forehead! ✨",
        "{user} peppers {target}'s face with kisses! 😍",
        "{target} got a surprise kiss from {user}! 🎁"
    ],
    hug: [
        "{user} hugs {target}! 🤗",
        "{user} gives {target} a warm hug! 💖",
        "{user} tightly hugs {target}! 🫂",
        "{user} embraces {target}! ✨",
        "{user} squeezes {target} in a bear hug! 🐻",
        "{user} wraps their arms around {target}! 💝",
        "{user} tackles {target} with a hug! 💥",
        "{user} refuses to let go of {target}! 🔒",
        "{user} pulls {target} into a comforting hug! 🌸",
        "{target} gets a massive hug from {user}! 💫"
    ],
    pat: [
        "{user} pats {target} on the head! 💆",
        "{user} gently pats {target}! ✨",
        "{user} comforts {target} with a pat! 🌸",
        "*pat pat* {user} pats {target}! 🖐️",
        "{user} pets {target} like a good kitty! 🐱",
        "{user} ruffles {target}'s hair! 💇",
        "{user} give {target} headpats! 💖",
        "There there... {user} pats {target}! 🍵",
        "{user} thinks {target} deserves a pat! ⭐",
        "{user} pats {target} affectionately! 🥰"
    ],
    slap: [
        "{user} slapped {target}! 👋",
        "{user} gives {target} a good slap! 💢",
        "{user} hit {target} with a slap! 😤",
        "Oof! {user} slapped {target}! 💫",
        "Kapow! {user} slaps {target}! 💥",
        "{user} slaps {target} across the face! 😱",
        "{user} decided {target} needed a slap! 🤚",
        "{target} felt the sting of {user}'s slap! 🔥",
        "Take that! {user} slaps {target}! ⚡",
        "{user} slaps some sense into {target}! 🧠"
    ],
    poke: [
        "{user} poked {target}! 👉",
        "{user} gives {target} a poke! 👆",
        "{user} boops {target}! 🐽",
        "Hey! {user} poked {target}! 💢",
        "{user} annoys {target} with pokes! 🌀",
        "{user} pokes {target}'s cheek! 😛",
        "{user} wants {target}'s attention! 👉",
        "Poke poke! {user} bothers {target}! 🔔",
        "{user} sneakily pokes {target}! 🕵️",
        "{target} got poked by {user}! 🎯"
    ],
    cuddle: [
        "{user} cuddles with {target}! 🧸",
        "{user} snuggles up to {target}! 💤",
        "{user} holds {target} close! 💖",
        "{target} is being cuddled by {user}! ✨",
        "{user} wants to cuddle with {target}! 🥰",
        "{user} and {target} are cuddling together! 🌸",
        "{user} spoons {target}! 🥄",
        "{user} keeps {target} warm with a cuddle! 🔥",
        "{user} buries their face in {target} while cuddling! 🙈",
        "Cuddle time for {user} and {target}! ⏰"
    ],
    kill: [
        "{user} killed {target}! 🔪",
        "{user} ended {target}! 💀",
        "{user} murdered {target}! 🩸",
        "R.I.P {target}, killed by {user}... 🪦",
        "{user} assassinated {target}! 🥷",
        "{user} decided {target} had to go... ⚰️",
        "{user} puts an end to {target}! 🚫",
        "{target} was wasted by {user}! 🔫",
        "{user} commits a crime against {target}! 🚔",
        "Fatality! {user} destroys {target}! 🧱"
    ],
    
    // Solo actions
    cry: [
        "{user} is crying... 😢",
        "{user} bursts into tears! 😭",
        "{user} is shedding tears... 💧",
        "Someone comfort {user}, they are crying... 😿",
        "{user} is having a bad day... 🌧️",
        "{user} can't stop crying! 🌊",
        "{user} needs a hug... 💔",
        "Tears are falling from {user}'s eyes... ☔",
        "{user} is sobbing uncontrollably! 🤧",
        "Why is {user} crying? :("
    ],
    smile: [
        "{user} is smiling! 😄",
        "{user} beams with a smile! ✨",
        "{user} looks happy! 💖",
        "{user} flashes a bright smile! 😁",
        "{user} is grinning from ear to ear! 😃",
        "{user}'s smile lights up the room! 💡",
        "{user} sends a smile to everyone! 💌",
        "{user} is in a good mood! 🎵",
        "{user} smiles warmly! ☀️",
        "Keep smiling {user}! 🌟"
    ]
};

const SELF_TEMPLATES = {
    kiss: "{user} tries to kiss themselves... mirrors exist? 😳",
    hug: "{user} hugs themselves... it's gonna be okay! 🫂",
    pat: "{user} pats themselves on the head. Good job! 💆",
    slap: "{user} slapped themselves... why? 🤨",
    poke: "{user} poked themselves. Did it hurt? 👉",
    cuddle: "{user} cuddles a pillow since they are alone... 🧸",
    kill: "{user} chose the easy way out... 💀"
};

/**
 * Fetch image from waifu.pics
 * @param {string} category 
 * @param {string} type 'sfw' or 'nsfw'
 * @returns {Promise<string>} Image URL
 */
export async function getWaifuImage(category, type = 'sfw') {
    try {
        const response = await fetch(`https://api.waifu.pics/${type}/${category}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error(`Waifu API Error (${category}):`, error);
        return null; // Return null on error
    }
}

/**
 * Handle generic anime interaction command
 * @param {import('discord.js').ChatInputCommandInteraction} interaction 
 * @param {string} category Waifu.pics category
 * @param {string} actionVerb Deprecated - text is now looked up from templates
 * @param {boolean} targetsUser Whether the action targets another user (default true)
 */
export async function handleAnimeInteraction(interaction, category, actionVerb, targetsUser = true) {
    await interaction.deferReply();
    
    // Check for self-target prevention or silly responses could be added here
    const target = targetsUser ? interaction.options.getUser('user') : null;
    
    // Construct message
    let description;
    
    if (targetsUser && target) {
        // Self targeting special cases
        if (target.id === interaction.user.id) {
            description = SELF_TEMPLATES[category] 
                ? SELF_TEMPLATES[category].replace('{user}', `**${interaction.user.username}**`)
                : `**${interaction.user.username}** ${actionVerb} themselves! 😳`;
        } else {
            // Random template for action
            const templates = ACTION_TEMPLATES[category];
            if (templates && templates.length > 0) {
                const template = templates[Math.floor(Math.random() * templates.length)];
                description = template
                    .replace('{user}', `**${interaction.user.username}**`)
                    .replace('{target}', `**${target.username}**`);
            } else {
                // Fallback
                 description = `**${interaction.user.username}** ${actionVerb} **${target.username}**!`;
            }
        }
    } else {
        // Solo action
        const templates = ACTION_TEMPLATES[category];
        if (templates && templates.length > 0) {
            const template = templates[Math.floor(Math.random() * templates.length)];
            description = template.replace('{user}', `**${interaction.user.username}**`);
        } else {
             // Fallback
            description = `**${interaction.user.username}** ${actionVerb}!`;
        }
    }

    const imageUrl = await getWaifuImage(category, 'sfw');

    const embed = new EmbedBuilder()
        .setDescription(description)
        .setColor(config.colors?.primary || 0x00ae86)
        .setImage(imageUrl)
        .setTimestamp();

    if (!imageUrl) {
        return interaction.editReply({ 
            content: '❌ Failed to fetch image. The API might be down.',
            ephemeral: true 
        });
    }

    await interaction.editReply({ embeds: [embed] });
}
