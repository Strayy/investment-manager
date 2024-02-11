const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
    userId: {
        required: true,
        type: String,
    },
    stockId: {
        required: true,
        type: String,
    },
    action: {
        required: true,
        type: String,
    },
    date: {
        required: true,
        type: Date,
    },
    price: {
        required: true,
        type: Number,
    },
    amount: {
        required: true,
        type: Number,
    },
});

module.exports = mongoose.model(`portfolio`, portfolioSchema);
