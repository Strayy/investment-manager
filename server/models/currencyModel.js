const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema({
    date: {
        required: true,
        type: Date,
    },
    currencyPair: {
        required: true,
        type: String,
    },
    rate: {
        required: true,
        type: Number,
    },
});

module.exports = mongoose.model("currency", currencySchema);
