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
    website: {
        required: false,
        type: String,
    },
    logo: {
        required: false,
        type: String,
    },
    color: {
        required: false,
        type: String,
    },
});

module.exports = mongoose.model("stocks-data", stocksSchema);
