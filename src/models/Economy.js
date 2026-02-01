import mongoose from 'mongoose';

const economySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    bank: {
        type: Number,
        default: 0,
        min: 0
    },
    inventory: [{
        itemId: String,
        itemName: String,
        quantity: Number,
        purchasedAt: {
            type: Date,
            default: Date.now
        }
    }],
    transactions: [{
        transactionType: String, // 'earn', 'spend', 'transfer_in', 'transfer_out'
        amount: Number,
        description: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Method to add balance
economySchema.methods.addBalance = function(amount, description = '') {
    this.balance += amount;
    this.transactions.push({
        transactionType: 'earn',
        amount,
        description
    });
    return this.balance;
};

// Method to remove balance
economySchema.methods.removeBalance = function(amount, description = '') {
    if (this.balance < amount) {
        return false;
    }
    this.balance -= amount;
    this.transactions.push({
        transactionType: 'spend',
        amount,
        description
    });
    return true;
};

// Method to transfer balance to another user
economySchema.methods.transferTo = async function(recipientEconomy, amount, description = '') {
    if (this.balance < amount) {
        return false;
    }
    
    this.balance -= amount;
    this.transactions.push({
        transactionType: 'transfer_out',
        amount,
        description
    });
    
    recipientEconomy.balance += amount;
    recipientEconomy.transactions.push({
        transactionType: 'transfer_in',
        amount,
        description
    });
    
    await recipientEconomy.save();
    return true;
};

// Method to add item to inventory
economySchema.methods.addItem = function(itemId, itemName, quantity = 1) {
    const existingItem = this.inventory.find(item => item.itemId === itemId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.inventory.push({
            itemId,
            itemName,
            quantity
        });
    }
};

export default mongoose.model('Economy', economySchema);
