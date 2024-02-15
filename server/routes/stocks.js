const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// RETURN RECENT PRICING INFORMATION FOR A GIVEN TICKER
router.get("/recentPricing", async (req, res) => {
    try {
        const [exchange, ticker] = req.query.stock.split("_");
        const currentYear = new Date().getFullYear();

        const allData = await mongoose.connection
            .collection(`performance-${exchange.toLowerCase()}`)
            .find({ stock: ticker })
            .sort({ date: -1 })
            .toArray();

        const dailyChangePercent =
            ((allData[0].adjClose - allData[1].adjClose) /
                allData[1].adjClose) *
            100;

        const calYearData = await mongoose.connection
            .collection(`performance-${exchange.toLowerCase()}`)
            .find({
                stock: ticker,
                date: {
                    $gte: new Date(`${currentYear}-01-01`),
                    $lt: new Date(`${currentYear + 1}-01-01`),
                },
            })
            .sort({ date: 1 })
            .toArray();

        const ytdChangePercent =
            (allData[0].adjClose / calYearData[0].adjClose - 1) * 100;

        res.status(400).json({
            latestPrice: allData[0],
            ytd: {
                percentage: ytdChangePercent,
                actual: allData[0].adjClose - calYearData[0].adjClose,
            },
            dailyChange: {
                percentage: dailyChangePercent,
                actual: allData[0].adjClose - allData[1].adjClose,
            },
        });
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
