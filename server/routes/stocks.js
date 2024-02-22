const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");

// RETURN RECENT PRICING INFORMATION FOR A GIVEN TICKER
router.get("/recentPricing", async (req, res) => {
    try {
        const [exchange, ticker] = req.query.stock.split("_");
        const currentYear = new Date().getFullYear();

        const performanceModel = await mongoose.connection.collection(
            `performance-${exchange.toLowerCase()}`,
        );

        const allData = await performanceModel.find({ stock: ticker }).sort({ date: -1 }).toArray();

        let mostRecentPricing;
        let dailyChangePercent;
        let ytdChangePercent;
        let calYearData;

        const updatePricing = async () => {
            await axios.post(
                `http://localhost:${process.env.PORT}/api/stock/updatePricing?stock=${req.query.stock}`,
            );

            await calculateChangePercents();
        };

        const calculateChangePercents = async () => {
            const allDataUpdated = await performanceModel
                .find({ stock: ticker })
                .sort({ date: -1 })
                .toArray();

            mostRecentPricing = allDataUpdated;

            dailyChangePercent =
                ((mostRecentPricing[0].adjClose - mostRecentPricing[1].adjClose) /
                    mostRecentPricing[1].adjClose) *
                100;

            calYearData = await mongoose.connection
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

            ytdChangePercent = (mostRecentPricing[0].adjClose / calYearData[0].adjClose - 1) * 100;
        };

        if (Object.keys(allData).length === 0) {
            await updatePricing();
        } else {
            const latestDate = new Date();
            latestDate.setDate(latestDate.getDate() - 5);

            if (new Date(allData[0].date) < latestDate) {
                await updatePricing();
            } else {
                mostRecentPricing = allData;
                await calculateChangePercents();
            }
        }

        res.status(200).json({
            latestPrice: mostRecentPricing[0],
            ytd: {
                percentage: ytdChangePercent,
                actual: mostRecentPricing[0].adjClose - calYearData[0].adjClose,
            },
            dailyChange: {
                percentage: dailyChangePercent,
                actual: mostRecentPricing[0].adjClose - mostRecentPricing[1].adjClose,
            },
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE PRICING INFORMATION FOR A GIVEN TICKER
router.post("/updatePricing", async (req, res) => {
    try {
        const [exchange, ticker] = req.query.stock.split("_");

        // Supported exchanges
        const exchangeSettings = {
            NASDAQ: {
                suffix: "",
                exchangeCode: "NMS",
            },
            NYSE: {
                suffix: "",
                exchangeCode: "NYQ",
            },
            ASX: {
                suffix: ".AX",
                exchangeCode: "ASX",
            },
        };

        // Find the MongoDB model associated with the exchange
        const performanceModel = mongoose.connection.collection(
            `performance-${exchange.toLowerCase()}`,
        );

        let rangeDates = [null, null];

        // Load existing pricing data for requested stock ticker
        const oldPricingData = await performanceModel
            .find({ stock: ticker })
            .sort({ date: -1 })
            .toArray();

        // Returns range to be used in API call for optimisation. E.g., 1d, 1mo, 6mo
        const rangeToUse = async () => {
            if (oldPricingData.length === 0) {
                return "5y";
            } else {
                const latestRecordedDate = new Date(oldPricingData[0].date);
                const currentDate = new Date();
                const rangeOptions = ["1d", "5d", "1mo", "3mo", "6mo", "1y"];
                const rangeThresholds = [1, 5, 28, 84, 168, 365];

                const daysDifference = (currentDate - latestRecordedDate) / (1000 * 60 * 60 * 24);
                const rangeIndex = rangeThresholds.findIndex(
                    (threshold) => daysDifference <= threshold,
                );

                return rangeOptions[rangeIndex] || "5y";
            }
        };

        // Ensures that the correct amounts of data are being provided by request. E.g., number of open data points should equal number of close data points
        const ensureDataCount = (newPricingData) => {
            const data = newPricingData["chart"]["result"][0];

            const dataCounts = [
                data["timestamp"].length,
                data["indicators"]["quote"][0]["open"].length,
                data["indicators"]["quote"][0]["close"].length,
                data["indicators"]["quote"][0]["low"].length,
                data["indicators"]["quote"][0]["high"].length,
                data["indicators"]["quote"][0]["volume"].length,
                data["indicators"]["adjclose"][0]["adjclose"].length,
            ];

            if (!dataCounts.every((element) => element === dataCounts[0])) {
                throw new Error(
                    `Data returned from Yahoo finance does not match. Counts: [${dataCounts}] in format [timestamp, open, close, low, high, volume, adjClose]`,
                );
            } else {
                return true;
            }
        };

        // Checks to ensure that the data returned from the request is for the same exchange that was requested. Done to avoid issues where a ticker exists on multiple exchanges for different companies. E.g., CAR (Car Group) on ASX vs CAR (Avis) on NASDAQ
        const ensureExchangeMatch = (newPricingData) => {
            const exchangeGiven = newPricingData["chart"]["result"][0]["meta"]["exchangeName"];

            if (exchangeSettings[exchange]["exchangeCode"] === exchangeGiven) {
                return true;
            } else {
                throw new Error(
                    `Data returned from Yahoo finance does not match exchange requested. Exchange requested: ${exchange} which should return ${exchangeSettings[exchange]["exchangeCode"]}. Exchange given from request: ${exchangeGiven}`,
                );
            }
        };

        // Checks to see if requested exchange is in list of supported exchanges
        if (Object.keys(exchangeSettings).includes(exchange)) {
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}${exchangeSettings[exchange] !== undefined ? exchangeSettings[exchange]["suffix"] : ""}?interval=1d&range=${await rangeToUse()}`,
                { timeout: 10000 },
            );

            const newPricingData = await response.json();

            // Throws an error if an error is returned from the request
            if (newPricingData["chart"]["result"] === null) {
                throw new Error(
                    `Error from Yahoo Finance: ${newPricingData["chart"]["error"]["description"]}`,
                );
            }

            // Checks that data counts and exchanges match
            if (ensureDataCount(newPricingData) && ensureExchangeMatch(newPricingData)) {
                const pricingData = newPricingData["chart"]["result"][0];

                // Loop through each timestamp in the timestamp array to create an array of objects in the required format for the MongoDB model.
                const documents = pricingData["timestamp"].map((timestamp, index) => {
                    if (
                        oldPricingData.length === 0 ||
                        (oldPricingData.length > 0 &&
                            new Date(timestamp * 1000) > new Date(oldPricingData[0].date))
                    ) {
                        return {
                            stock: ticker,
                            date: new Date(timestamp * 1000),
                            open: pricingData["indicators"]["quote"][0]["open"][index],
                            high: pricingData["indicators"]["quote"][0]["high"][index],
                            low: pricingData["indicators"]["quote"][0]["low"][index],
                            close: pricingData["indicators"]["quote"][0]["close"][index],
                            adjClose: pricingData["indicators"]["adjclose"][0]["adjclose"][index],
                            volume: pricingData["indicators"]["quote"][0]["volume"][index],
                        };
                    } else {
                        return;
                    }
                });

                // Only attempt to add to database if documents contains at least one valid entry.
                if (!documents.every((document) => document === undefined)) {
                    const filteredDocuments = documents.filter(Boolean);

                    await performanceModel.insertMany(filteredDocuments);

                    rangeDates[0] = new Date(filteredDocuments[0].date);
                    rangeDates[1] = new Date(filteredDocuments[filteredDocuments.length - 1].date);
                }
            }
        } else {
            throw new Error(
                `Exchange is not supported. Supported exchanges: ${Object.keys(exchangeSettings)}`,
            );
        }

        res.status(200).json({
            message:
                rangeDates[0] !== null && rangeDates[1] !== null
                    ? `Updated pricing data for ${exchange}_${ticker} successfully`
                    : `Request successfully sent, but no data added to database.`,
            from: rangeDates[0],
            to: rangeDates[1],
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
