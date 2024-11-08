const express = require("express");
const router = express.Router();
const supportedCurrenncies = [
    "USD",
    "EUR",
    "JPY",
    "GBP",
    "CNY",
    "AUD",
    "CAD",
    "CHF",
    "HKD",
    "SGD",
    "SEK",
    "KRW",
    "NOK",
    "NZD",
    "INR",
];

const currencyModel = require("../models/currencyModel");

// ENDPOINT TO RETURN EXCHANGE RATE FOR CURRENCY PAIR
router.get("/rate", async (req, res) => {
    try {
        const fromCurrency = req.query.from;
        const toCurrency = req.query.to;

        // Throws an error if the from currency is not specified in request.
        if (!fromCurrency) {
            throw new Error("No currency to be converted from specified in request.");
        }

        // Throws an error if the to currency is not specified in request.
        if (!toCurrency) {
            throw new Error("No currency to be converted to specified in request.");
        }

        // Throws an error if the from or to currency is not supported
        if (
            !supportedCurrenncies.includes(fromCurrency) ||
            !supportedCurrenncies.includes(toCurrency)
        ) {
            throw new Error(
                `Currency ${!supportedCurrenncies.includes(fromCurrency) ? fromCurrency : ""} ${!supportedCurrenncies.includes(toCurrency) ? toCurrency : ""} is not supported in list of currencies`,
            );
        }

        // Find most recent data entry in last 12 hours
        let data = await currencyModel
            .findOne({
                currencyPair: `${fromCurrency}_${toCurrency}`,
                date: { $gte: new Date(Date.now() - 60 * 60 * 12 * 1000) },
            })
            .sort({ date: -1 });

        const updatePair = async () => {
            const conversionData = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);

            const conversionJson = await conversionData.json();

            // Throw an error if API returns result as anything other than success.
            if (conversionJson.result !== "success") {
                throw new Error(
                    `Currency conversion endpoint failed with result: ${conversionJson.result}`,
                );
            }

            data = {
                currencyPair: `${fromCurrency}_${toCurrency}`,
                date: new Date(conversionJson.time_last_update_unix * 1000),
                rate: Number(conversionJson.rates[toCurrency]),
            };

            supportedCurrenncies.forEach(async (currency) => {
                if (currency === fromCurrency) {
                    return;
                }

                await currencyModel.insertMany({
                    date: new Date(conversionJson.time_last_update_unix * 1000),
                    currencyPair: `${fromCurrency}_${currency}`,
                    rate: Number(conversionJson.rates[toCurrency]),
                });
            });
        };

        // Update currency data if no rates exist or have been obtained within last 12 hours
        if (data === null) {
            await updatePair();
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
