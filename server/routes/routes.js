const express = require("express");
const router = express.Router();
router.use(express.json());

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

const currencyRouter = require("./currency");
router.use("/currency", currencyRouter);

module.exports = router;
