const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

router.use(bodyParser.json());

const portfolioModel = require("../models/portfolioModel");

// RETURN LIST OF TRADES
router.get("/getTrades", async (req, res) => {
    try {
        const data = await portfolioModel.find({ userId: req.query.userId });

        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// RETURN MOST RECENT TRANSACTIONS. RETURNS FOR ALL INVESTMENTS IF STOCKID NOT SPECIFIED, OR SINGLE STOCK IF SPECIFIED
router.get("/getMostRecentTransaction", async (req, res) => {
    try {
        if (!req.query.stockId) {
            const distinctValues = await portfolioModel.distinct("stockId", {
                userId: req.query.userId,
            });

            let latestTransactions = {};

            await Promise.all(
                distinctValues.map(async (stock) => {
                    const data = await portfolioModel
                        .find({
                            userId: req.query.userId,
                            stockId: stock,
                        })
                        .sort({ date: -1 });

                    latestTransactions[stock] = data[0];
                })
            );

            res.status(200).json(latestTransactions);
        } else {
            const data = await portfolioModel
                .find({ userId: req.query.userId, stockId: req.query.stockId })
                .sort({ date: -1 });

            const latestTransaction = { [req.query.stockId]: data[0] };

            res.status(200).json(latestTransaction);
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// TODO - Add endpoint for adding transaction/trade
// ADD TRADE TO TRANSACTIONS
router.post("/addTrade", async (req, res) => {
    try {
        console.log(req);

        res.status(200).json({ message: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// TODO - Add percentage of portfolio to data returned
// GET CURRENT HOLDINGS
router.get("/getHoldings", async (req, res) => {
    try {
        const distinctValues = await portfolioModel.distinct("stockId", {
            userId: req.query.userId,
        });
        let holdings = {};

        await Promise.all(
            distinctValues.map(async (stock) => {
                let avgPrice = 0;
                let buyCount = 0;
                let amount = 0;

                const singleStockData = await portfolioModel.find({
                    userId: req.query.userId,
                    stockId: stock,
                });

                singleStockData.map((transaction) => {
                    if (transaction["action"] == "BUY") {
                    }

                    if (transaction["action"] == "BUY") {
                        amount += transaction["amount"];

                        avgPrice =
                            (avgPrice * buyCount +
                                transaction["price"] * transaction["amount"]) /
                            (buyCount + transaction["amount"]);

                        buyCount += transaction["amount"];
                    } else if (transaction["action"] == "SELL") {
                        amount -= transaction["amount"];
                    }
                });

                holdings[stock] = {
                    amount: amount,
                    averageBuyPrice: Number(avgPrice.toFixed(2)),
                };
            })
        );

        res.status(200).json(holdings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
