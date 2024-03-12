const express = require("express");
const router = express.Router();
router.use(express.json());
const csvToJson = require("csvtojson");

// SEED DATABASE ENDPOINTS
const seedRouter = require("./seed");
router.use("/seed", seedRouter);

// PORTFOLIO ENDPOINTS
const portfolioRouter = require("./portfolio");
router.use("/portfolio", portfolioRouter);

// STOCKS ENDPOINTS
const stocksRouter = require("./stocks");
router.use("/stock", stocksRouter);

// USERS ENDPOINTS
const usersRouter = require("./user");
router.use("/users", usersRouter);

//TODO - Update stock price data endpoint to return from db
// RETURN STOCK PRICE DATA
router.get("/getData/:ticker", async (req, res) => {
    try {
        const jsonData = await csvToJson().fromFile(`./data/${req.params.ticker}.csv`);
        res.send(JSON.stringify(jsonData));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
