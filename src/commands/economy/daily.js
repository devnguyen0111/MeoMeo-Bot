import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed.js';
import Economy from '../../models/Economy.js';
import User from '../../models/User.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        
        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId });
            await user.save();
        }
        
        // Check if can claim
        if (!user.canClaimDaily()) {
            const timeRemaining = user.getTimeUntilDaily();
            const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            
            return interaction.reply({
                embeds: [errorEmbed(
                    'Already Claimed',
                    `You've already claimed your daily reward!\nCome back in **${hours}h ${minutes}m**`
                )],
                ephemeral: true
            });
        }
        
        // Calculate reward with random bonus
        const baseReward = Math.floor(
            Math.random() * (config.dailyRewardMax - config.dailyRewardMin + 1) + config.dailyRewardMin
        );
        const bonus = Math.random() < 0.1 ? Math.floor(baseReward * 0.5) : 0; // 10% chance for 50% bonus
        const totalReward = baseReward + bonus;
        
        // Update economy
        let economy = await Economy.findOne({ userId });
        if (!economy) {
            economy = new Economy({ userId });
        }
        
        economy.addBalance(totalReward, 'Daily reward');
        await economy.save();
        
        // Update user last daily
        user.lastDaily = new Date();
        await user.save();
        
        const embed = successEmbed(
            '💰 Daily Reward Claimed!',
            `You received **${totalReward} coins**!${bonus > 0 ? `\n🎉 Bonus: +${bonus} coins!` : ''}\n\nNew balance: **${economy.balance.toLocaleString()}** coins`
        );
        
        await interaction.reply({ embeds: [embed] });
    }
};
