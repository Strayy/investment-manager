const mongoose = require("mongoose");

const stocksSchema = new mongoose.Schema({
    id: {
        required: true,
        type: String,
    },
    ticker: {
        required: true,
        type: String,
    },
    name: {
        required: true,
        type: String,
    },
    exchange: {
        required: true,
        type: String,
    },
    currency: {
        required: false,
        type: String,
    },
    website: {
        required: false,
        type: String,
    },
    city: {
        required: false,
        type: String,
    },
    country: {
        required: false,
        type: String,
    },
    industry: {
        required: false,
        type: String,
    },
    sector: {
        required: false,
        type: String,
    },
    shortDescription: {
        required: false,
        type: String,
    },
    description: {
        required: false,
        type: String,
    },
    socialMedia: {
        required: false,
        type: [
            {
                name: String,
                url: String,
            },
        ],
    },
    logos: {
        required: false,
        type: mongoose.Schema.Types.Mixed,
    },
    colors: {
        required: false,
        type: mongoose.Schema.Types.Mixed,
    },
});

module.exports = mongoose.model("stocks-data", stocksSchema);
