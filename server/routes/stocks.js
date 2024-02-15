const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// RETURN RECENT PRICING INFORMATION FOR A GIVEN TICKER
router.get("/recentPricing", async (req, res) => {
    try {
        const [exchange, ticker] = req.query.stock.split("_");

        const data = await mongoose.connection
            .collection(`performance-${exchange.toLowerCase()}`)
            .find({ stock: ticker })
            .sort({ date: -1 });

        const output = await data.toArray();

        res.status(400).json(output[0]);
    } catch (err) {
        res.status(200).json({ message: err.message });
    }
});

// UPDATE PRICING INFORMATION FOR A GIVEN TICKER
router.post("/updatePricing", async (req, res) => {
    try {
        console.log(req.query.userId);

        res.status(400).json(true);
    } catch (err) {
        res.status(200).json({ message: err.message });
    }
});

module.exports = router;
