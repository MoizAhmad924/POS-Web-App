const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    cartTotal: {
        type: Number,
        default: 0
    },
    cart: [{
        productId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    inventory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory'
    }]
});

module.exports = mongoose.model('User', UserSchema);
