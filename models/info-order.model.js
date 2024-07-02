const mongoose = require("mongoose");

const infoOrderSchema = new mongoose.Schema({
    // user_id: String, 
    cart_id: String,
    userInfo: {
        fullName: String,
        phone: String,
        address: String
    },
    products: [
        {
            product_id: String,
            price: Number,
            discountPercentage: Number,
            quantity: Number
        }
    ],
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
}, {
    timestamps: true
});

const InfoOrder = mongoose.model("InfoOrder", infoOrderSchema, "info-orders");

module.exports = InfoOrder;