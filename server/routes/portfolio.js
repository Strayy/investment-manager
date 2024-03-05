const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios");

router.use(bodyParser.json());

const portfolioModel = require("../models/portfolioModel");

const exchangeSettings = require("../data/exchangeSettings");
const stocksModel = require("../models/stocksModel");
const userModel = require("../models/userModel");

// RETURN LIST OF TRADES
router.get("/getTrades", async (req, res) => {
    try {
        if (!req.query.userId) {
            throw new Error("No userId specified in GET request");
        }

        const data = await portfolioModel.find({ userId: req.query.userId });

        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// RETURN MOST RECENT TRANSACTIONS. RETURNS FOR ALL INVESTMENTS IF STOCKID NOT SPECIFIED, OR SINGLE STOCK IF SPECIFIED
router.get("/getMostRecentTransaction", async (req, res) => {
    try {
        if (!req.query.userId) {
            throw new Error("Missing userId in request");
        }

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
                }),
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

// ADD TRADE TO TRANSACTIONS
router.post("/addTrade", async (req, res) => {
    try {
        const [exchange, ticker] = req.body.stockId.split("_");

        if (
            !req.body.userId ||
            !req.body.stockId ||
            !req.body.action ||
            !req.body.date ||
            !req.body.price ||
            !req.body.amount
        ) {
            throw new Error("Request body is missing data");
        }

        if (!["BUY", "SELL"].includes(req.body.action)) {
            throw new Error(
                `Action '${req.body.action}' is not a supported action. Currently supported actions are 'BUY' and 'SELL`,
            );
        }

        if (!Object.keys(exchangeSettings).includes(exchange)) {
            throw new Error(
                `Stocks on ${exchange} are currently not supported. Supported exchanges: ${Object.keys(exchangeSettings)}`,
            );
        }

        const supportedStocks = await stocksModel.distinct("ticker", {
            exchange: exchange,
        });

        if (!supportedStocks.includes(ticker)) {
            throw new Error(
                `${req.body.stockId} is not a currently supported stock on the ${exchange}`,
            );
        }

        const userProfile = await userModel.findOne({ id: req.body.userId });

        if (userProfile === null) {
            throw new Error(`User with id: '${req.body.userId}' not found.`);
        }

        const newTransaction = await portfolioModel.create({
            userId: req.body.userId,
            stockId: req.body.stockId,
            action: req.body.action,
            date: new Date(req.body.date),
            price: req.body.price,
            amount: req.body.amount,
        });

        res.status(200).json({
            message: `${req.body.stockId} transaction added successfully.`,
            data: newTransaction,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET CURRENT HOLDINGS
router.get("/getHoldings", async (req, res) => {
    try {
        const distinctValues = await portfolioModel.distinct("stockId", {
            userId: req.query.userId,
        });
        let holdings = {};
        let totalPortfolioValue = 0;
        let latestPricing = {};

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
                        amount += transaction["amount"];

                        avgPrice =
                            (avgPrice * buyCount + transaction["price"] * transaction["amount"]) /
                            (buyCount + transaction["amount"]);

                        buyCount += transaction["amount"];
                    } else if (transaction["action"] == "SELL") {
                        amount -= transaction["amount"];
                    }
                });

                const recentPricing = await axios.get(
                    `http://localhost:${process.env.PORT}/api/stock/recentPricing?stock=${stock}`,
                );

                if (amount !== 0) {
                    holdings[stock] = {
                        amount: amount,
                        averageBuyPrice: Number(avgPrice.toFixed(2)),
                    };

                    latestPricing[stock] = recentPricing.data.latestPrice.adjClose;

                    totalPortfolioValue += recentPricing.data.latestPrice.adjClose * amount;
                }
            }),
        );

        await Promise.all(
            distinctValues.map((stock) => {
                if (holdings[stock]) {
                    holdings[stock]["percentage"] =
                        ((latestPricing[stock] * holdings[stock].amount) / totalPortfolioValue) *
                        100;
                }
            }),
        );

        res.status(200).json({
            portfolio: { totalValue: totalPortfolioValue },
            holdings: holdings,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
