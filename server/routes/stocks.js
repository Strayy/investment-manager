const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const fuse = require("fuse.js");

const exchangeSettings = require("../data/exchangeSettings");
const getYahooCrumb = require("../scripts/getYahooCredentials");

const stocksModel = require("../models/stocksModel");

let cookies, crumb;

// Get Yahoo Finance cookie and crumb when loading server
(async () => {
    try {
        [cookies, crumb] = await getYahooCrumb();

        if (cookies !== undefined && crumb !== undefined) {
            console.warn("Yahoo Credentials Loaded Successfully");
        } else {
            throw new Error();
        }
    } catch (err) {
        console.error("Error getching Yahoo credentials");
    }
})();

// GET STOCK PROFILE
router.get("/getStockProfile", async (req, res) => {
    try {
        // Throw an error if stockId is not given in request.
        if (!req.query.stockId) {
            throw new Error("No stockId specified in request query");
        }

        // Search existing stock profiles for stockId.
        let stockProfile = await stocksModel.find({ id: req.query.stockId });

        // Throw an error if no stock is found with specified stockId
        if (stockProfile.length === 0) {
            throw new Error(`Stock ${req.query.stockId} not found.`);
        }

        // If website does not exist, create profile for stock.
        if (!stockProfile[0].website) {
            const createProfileResponse = await axios.post(
                `http://localhost:${process.env.PORT}/api/stock/createStockProfile?stock=${req.query.stockId}`,
            );

            stockProfile = [createProfileResponse.data.data];
        }

        res.status(200).json(stockProfile[0]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// CREATE STOCK PROFILE
router.post("/createStockProfile", async (req, res) => {
    try {
        const [exchange, ticker] = req.query.stock.split("_");

        // If cookies and crumb do not exist before running endpoint, throw error.
        if (cookies === undefined || crumb === undefined) {
            throw new Error(
                "Failed to get Yahoo cookie and crumb before /createStockProfile request. Please try again or restart server.",
            );
        }

        // Convert URL in the form https://www.tesla.com to tesla.com
        const extractDomain = (url) => {
            const urlMatch = url.match(/:\/\/(www\.)?(.+?)(\/|$)/);

            if (urlMatch) {
                const domain = urlMatch[2];
                const cleanedDomain = domain.replace(/^[^:]+:/, "");

                return cleanedDomain;
            }

            return url;
        };

        // Format logos returned from Brandfetch API to be stored in database
        const formatLogos = (brandfetchData) => {
            const logos = {};

            brandfetchData["logos"].forEach((logo) => {
                logos[`${logo["theme"]}_${logo["type"]}`] = logo["formats"].filter(
                    (logo) => logo.format !== "svg",
                )[0]["src"];
            });

            return logos;
        };

        // Format colours returned from Brandfetch API to be stored in database
        const formatColors = (brandfetchData) => {
            const colors = {};

            brandfetchData["colors"].forEach((color) => {
                colors[color.type] = color.hex;
            });

            return colors;
        };

        // Checks to see if requested exchange is in list of supported exchanges
        if (Object.keys(exchangeSettings).includes(exchange)) {
            // Query Yahoo API to retrieve company information based on ticker.
            const yahooResponse = await fetch(
                `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}${exchangeSettings[exchange] !== undefined ? exchangeSettings[exchange]["yahooFinanceSuffix"] : ""}?formatted=true&crumb=${crumb}&modules=assetProfile`,
                {
                    timeout: 10000,
                    method: "GET",
                    headers: {
                        Cookie: cookies
                            .map((cookie) => `${cookie.name}=${cookie.value}`)
                            .join("; "),
                        "Content-Type": "application/json",
                    },
                },
            );

            // Throw an error if Yahoo finance API fails
            if (yahooResponse.status !== 200) {
                throw new Error(`Error from Yahoo Finance API: ${yahooResponse.message}`);
            }

            const yahooCompanyData = await yahooResponse.json();

            const yahooData = yahooCompanyData["quoteSummary"]["result"][0]["assetProfile"];

            // Throws an error if an error is returned from the request
            if (yahooCompanyData["quoteSummary"]["error"] !== null) {
                throw new Error(
                    `Error from Yahoo Finance: ${yahooCompanyData["quoteSummary"]["error"]}`,
                );
            }

            // Query Brandfetch API to retrieve company information based on company website.
            const brandfetchResponse = await fetch(
                `https://api.brandfetch.io/v2/brands/${extractDomain(yahooData["website"])}`,
                {
                    method: "GET",
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${process.env.BRANDFETCH_KEY}`,
                    },
                },
            );

            // Throw an error if Brandfetch API fails
            if (brandfetchResponse.status !== 200) {
                throw new Error(`Error from Brandfetch API: ${brandfetchData.message}`);
            }

            const brandfetchData = await brandfetchResponse.json();

            // Upserts the database with information from Brandfetch and Yahoo Finance
            const databaseResponse = await stocksModel.findOneAndUpdate(
                { id: req.query.stock },
                {
                    $set: {
                        name: brandfetchData["name"],
                        exchange: exchange,
                        website: yahooData["website"],
                        city: yahooData["city"],
                        country: yahooData["country"],
                        industry: yahooData["industryDisp"],
                        sector: yahooData["sectorDisp"],
                        shortDescription: brandfetchData["description"],
                        description: brandfetchData["longDescription"],
                        socialMedia: brandfetchData["links"],
                        logos: formatLogos(brandfetchData),
                        colors: formatColors(brandfetchData),
                    },
                },
                { upsert: true, new: true, runValidators: true },
            );

            res.status(200).json({
                message: `Updated stock profile for ${req.query.stock}.`,
                data: databaseResponse,
            });
        } else {
            throw new Error(
                `Exchange is not supported. Supported exchanges: ${Object.keys(exchangeSettings)}`,
            );
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE STOCK PROFILE
router.post("/updateStockProfile", async (req, res) => {
    try {
        if (!req.body.stock) {
            throw new Error("No stock specified in request body");
        }

        if (!req.body.data) {
            throw new Error("No data specified in request body.");
        }

        const result = await stocksModel.findOneAndUpdate(
            { id: req.body.stock },
            { $set: req.body.data },
            { upsert: true, new: true, runValidators: true },
        );

        res.status(200).json({
            message: `Updated ${Object.keys(req.body.data)} of ${req.body.stock}`,
            result: result,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// SEARCH STOCK PROFILES
router.post("/searchProfile", async (req, res) => {
    try {
        const allStocks = await stocksModel.find({});

        const fuzzySearchOptions = {
            keys: ["ticker", "name"],
            threshold: 0.5,
        };

        const fuzzySearch = new fuse(allStocks, fuzzySearchOptions);

        const fuzzySearchResult = fuzzySearch.search(req.body.searchTerm).slice(0, 5);

        res.status(200).json(fuzzySearchResult);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// RETURN RECENT PRICING INFORMATION FOR A GIVEN TICKER
router.get("/recentPricing", async (req, res) => {
    try {
        const [exchange, ticker] = req.query.stock.split("_");
        const currentYear = new Date().getFullYear();

        // Find the MongoDB model associated with the exchange
        const performanceModel = await mongoose.connection.collection(
            `performance-${exchange.toLowerCase()}`,
        );

        // Find all existing pricing data stored for a given ticker
        const allData = await performanceModel.find({ stock: ticker }).sort({ date: -1 }).toArray();

        let mostRecentPricing;
        let dailyChangePercent;
        let ytdChangePercent;
        let calYearData;

        // Force update pricing if needed
        const updatePricing = async () => {
            await axios.post(
                `http://localhost:${process.env.PORT}/api/stock/updatePricing?stock=${req.query.stock}`,
            );

            await calculateChangePercents();
        };

        // Calculate the daily and YTD percentage changes and assign calendar year data
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

            // Find all data from current year and sort in ascending order by date
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

        // Force update pricing data if no existing pricing data found in database
        if (Object.keys(allData).length === 0) {
            await updatePricing();
        } else {
            const latestDate = new Date();
            latestDate.setDate(latestDate.getDate() - 5);

            // Force update pricing data if data is more than 5 days old
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

        // Checks to ensure data being added is in the correct currency.
        const validateCurrency = async (currency) => {
            const data = await stocksModel.findOne({ id: req.query.stock });
            const savedCurrency = data["currency"];

            if (savedCurrency !== undefined && savedCurrency !== currency) {
                throw new Error(
                    `Currency received from request does not match that stored in ${req.query.stock}'s stock profile. Request gave ${currency}, but ${req.query.stock} is recorded as being in ${savedCurrency}`,
                );
            }

            if (savedCurrency === undefined) {
                await axios.post(
                    `http://localhost:${process.env.PORT}/api/stock/updateStockProfile`,
                    {
                        stock: req.query.stock,
                        data: {
                            currency: currency,
                        },
                    },
                );
            }

            return true;
        };

        // Checks to see if requested exchange is in list of supported exchanges
        if (Object.keys(exchangeSettings).includes(exchange)) {
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}${exchangeSettings[exchange] !== undefined ? exchangeSettings[exchange]["yahooFinanceSuffix"] : ""}?interval=1d&range=${await rangeToUse()}`,
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
            if (
                ensureDataCount(newPricingData) &&
                ensureExchangeMatch(newPricingData) &&
                (await validateCurrency(newPricingData["chart"]["result"][0]["meta"]["currency"]))
            ) {
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
