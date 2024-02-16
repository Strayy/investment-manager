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
        const [exchange, ticker] = req.query.stock.split("_");

        const performanceModel = mongoose.connection.collection(
            `performance-${exchange.toLowerCase()}`
        );

        const oldPricingData = await performanceModel
            .find({ stock: ticker })
            .sort({ date: -1 })
            .toArray();

        let newPricingData;
        const failedImport = [];

        let latestDate = null;

        if (Object.values(oldPricingData).length !== 0) {
            latestDate = new Date(oldPricingData[0].date);
            latestDate.setDate(latestDate.getDate() + 1);
        } else {
            latestDate = new Date();
            latestDate.setDate(latestDate.getDate() - 5 * 365);
        }

        if (latestDate !== null) {
            const response = await fetch(
                `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=${
                    process.env.FMP_KEY
                }&from=${latestDate.toISOString().split("T")[0]}`,
                { timeout: 10000 }
            );

            newPricingData = await response.json();

            if (newPricingData.historical !== undefined) {
                const documents = newPricingData.historical.map((day) => {
                    if (
                        day["date"] !== null &&
                        day["open"] !== null &&
                        day["high"] !== null &&
                        day["low"] !== null &&
                        day["close"] !== null &&
                        day["adjClose"] !== null &&
                        day["volume"] !== null
                    ) {
                        return {
                            stock: ticker,
                            date: new Date(day["date"]),
                            open: day["open"],
                            high: day["high"],
                            low: day["low"],
                            close: day["close"],
                            adjClose: day["adjClose"],
                            volume: day["volume"],
                        };
                    } else {
                        failedImport.push({
                            data: day,
                            message: err.message,
                        });
                        return;
                    }
                });

                await performanceModel.insertMany(documents.filter(Boolean));
            } else {
                failedImport.push({
                    data: newPricingData,
                    message: "Object is empty",
                });
            }
        }

        res.status(400).json({
            message: `Updated pricing data for ${exchange}_${ticker} successfully`,
            from: latestDate.toISOString().split("T")[0],
            to:
                Object.values(newPricingData).length !== 0
                    ? newPricingData.historical[0].date
                    : new Date().toISOString().split("T")[0],
            failedImport: failedImport,
        });
    } catch (err) {
        res.status(200).json({ message: err.message });
    }
});

module.exports = router;
