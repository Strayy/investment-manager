const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
    stock: {
        required: true,
        type: String,
    },
    date: {
        required: true,
        type: Date,
    },
    open: {
        required: true,
        type: Number,
    },
    high: {
        required: true,
        type: Number,
    },
    low: {
        required: true,
        type: Number,
    },
    close: {
        required: true,
        type: Number,
    },
    adjClose: {
        required: true,
        type: Number,
    },
    volume: {
        required: true,
        type: Number,
    },
});

module.exports = pricingSchema;
