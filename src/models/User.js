import mongoose from 'mongoose';
import config from '../../config/config.js';

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // Leveling
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    // Voice tracking
    voiceJoinedAt: {
        type: Date,
        default: null
    },
    totalVoiceTime: {
        type: Number,
        default: 0 // in minutes
    },
    voiceTimeToday: {
        type: Number,
        default: 0 // in minutes
    },
    lastVoiceReset: {
        type: Date,
        default: Date.now
    },
    // Economy
    lastDaily: {
        type: Date,
        default: null
    },
    // Moderation
    warnings: [{
        reason: String,
        moderator: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Method to add XP and check for level up
userSchema.methods.addXP = function(amount) {
    this.xp += amount;
    
    const levelUps = [];
    while (this.xp >= config.xpFormula(this.level)) {
        this.xp -= config.xpFormula(this.level);
        this.level += 1;
        levelUps.push(this.level);
    }
    
    return levelUps;
};

// Method to check if user can claim daily reward
userSchema.methods.canClaimDaily = function() {
    if (!this.lastDaily) return true;
    
    const now = new Date();
    const hoursSinceLastDaily = (now - this.lastDaily) / (1000 * 60 * 60);
    
    return hoursSinceLastDaily >= 24;
};

// Method to get time until next daily
userSchema.methods.getTimeUntilDaily = function() {
    if (!this.lastDaily) return 0;
    
    const now = new Date();
    const hoursSinceLastDaily = (now - this.lastDaily) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, 24 - hoursSinceLastDaily);
    
    return Math.ceil(hoursRemaining * 60 * 60 * 1000); // Return in milliseconds
};

// Method to reset daily voice time
userSchema.methods.resetDailyVoiceTime = function() {
    const now = new Date();
    const lastReset = this.lastVoiceReset;
    
    // Check if it's a new day
    if (now.getDate() !== lastReset.getDate() || 
        now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
        this.voiceTimeToday = 0;
        this.lastVoiceReset = now;
    }
};

export default mongoose.model('User', userSchema);
