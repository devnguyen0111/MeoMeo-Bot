import { Events } from 'discord.js';
import User from '../models/User.js';
import config from '../../config/config.js';
import logger from '../utils/logger.js';

// Track users currently in voice channels
const voiceTracking = new Map();

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const userId = newState.id;
        
        // User joined a voice channel
        if (!oldState.channelId && newState.channelId) {
            await handleVoiceJoin(userId, newState);
        }
        
        // User left a voice channel
        else if (oldState.channelId && !newState.channelId) {
            await handleVoiceLeave(userId, oldState);
        }
        
        // User switched voice channels
        else if (oldState.channelId !== newState.channelId) {
            await handleVoiceLeave(userId, oldState);
            await handleVoiceJoin(userId, newState);
        }
        
        // User muted/deafened (no action needed for XP tracking)
    }
};

async function handleVoiceJoin(userId, state) {
    // Ignore if in AFK channel
    if (state.guild.afkChannelId && state.channelId === state.guild.afkChannelId) {
        logger.debug(`User ${userId} joined AFK channel, not tracking`);
        return;
    }
    
    // Ignore if user is alone in channel (optional anti-abuse)
    const channel = state.channel;
    if (channel && channel.members.size <= 1) {
        logger.debug(`User ${userId} is alone in voice channel`);
        // Still track, but you could add logic to not give XP when alone
    }
    
    // Save join timestamp
    voiceTracking.set(userId, Date.now());
    
    // Update database
    try {
        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId });
        }
        
        user.voiceJoinedAt = new Date();
        await user.save();
        
        logger.debug(`User ${userId} joined voice channel`);
    } catch (error) {
        logger.error(`Error tracking voice join for ${userId}:`, error);
    }
}

async function handleVoiceLeave(userId, state) {
    // Get join timestamp
    const joinTime = voiceTracking.get(userId);
    if (!joinTime) return;
    
    // Calculate time spent in voice
    const leaveTime = Date.now();
    const timeInVoice = Math.floor((leaveTime - joinTime) / 1000 / 60); // in minutes
    
    if (timeInVoice < 1) {
        voiceTracking.delete(userId);
        return; // Less than 1 minute, don't give XP
    }
    
    // Update database
    try {
        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId });
        }
        
        // Reset daily voice time if needed
        user.resetDailyVoiceTime();
        
        // Add voice time
        user.totalVoiceTime += timeInVoice;
        user.voiceTimeToday += timeInVoice;
        user.voiceJoinedAt = null;
        
        // Add XP
        const xpGained = timeInVoice * config.voiceXpPerMinute;
        const levelUps = user.addXP(xpGained);
        
        await user.save();
        
        logger.debug(`User ${userId} left voice: ${timeInVoice}min, ${xpGained}XP gained`);
        
        // If user leveled up, you could send a message (optional)
        if (levelUps.length > 0) {
            logger.info(`User ${userId} leveled up to ${levelUps[levelUps.length - 1]}!`);
            // Optionally send a DM or channel message about level up
        }
        
    } catch (error) {
        logger.error(`Error tracking voice leave for ${userId}:`, error);
    }
    
    voiceTracking.delete(userId);
}
