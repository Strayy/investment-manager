const express = require("express");
const router = express.Router();

// ENDPOINT TO RETURN EXCHANGE RATE FOR CURRENCY PAIR
router.get("/rate", async (req, res) => {
    try {
        // Throws an error if the from currency is not specified in request.
        if (!req.query.from) {
            throw new Error("No currency to be converted from specified in request.");
        }

        // Throws an error if the to currency is not specified in request.
        if (!req.query.to) {
            throw new Error("No currency to be converted to specified in request.");
        }

        const fromCurrency = req.query.from;
        const toCurrency = req.query.to;

        const conversionData = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);

        const conversionJson = await conversionData.json();

        // Throw an error if API returns result as anything other than success.
        if (conversionJson.result !== "success") {
            throw new Error(
                `Currency conversion endpoint failed with result: ${conversionJson.data.result}`,
            );
        }

        res.status(200).json(conversionJson.rates[toCurrency]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
