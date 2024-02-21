const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const path = require("path");
const csvtojson = require("csvtojson");
const fs = require("fs").promises;

const seedFolder = "./seed_data";

mongoose.pluralize(null);
const localPort = process.env.PORT;

// Function to return all seed files found in the /seed_data/ directory
async function getSeedFiles() {
    try {
        const files = await fs.readdir(seedFolder);
        return files;
    } catch (err) {
        console.error(err.message);
        throw new Error(err);
    }
}

// Function to validate CSV seed files. Takes list of inputted files and returns list of accepted files by file type and prefix, and returns list of rejected files.
function validateFiles(prefix, fileType, fileList) {
    if (fileList.length > 0) {
        const stockFiles = fileList.filter((file) => file.startsWith(prefix));

        const acceptedFiles = [];
        const rejectedFiles = [];

        stockFiles.forEach((file) => {
            if (file.endsWith(fileType)) {
                acceptedFiles.push(file);
            } else {
                rejectedFiles.push({
                    file: file,
                    reason: `file is not of type ${fileType}`,
                });
            }
        });

        return [acceptedFiles, rejectedFiles];
    }
    throw new Error("No seed files found in /seed_data/.");
}

// Function to convert keys of an object to lowercase for storage in database
function convertKeysToLowercase(obj) {
    const convertedObject = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const lowercaseKey = key.toLowerCase();
            convertedObject[lowercaseKey] = obj[key];
        }
    }

    return convertedObject;
}

// SEED DATABASE WITH ALL INFO
router.post("/all", async (req, res) => {
    try {
        const seedEndpoints = {
            seedStocks: {
                endpoint: "/seed/stocks",
                method: axios.post,
            },
            seedPerformance: {
                endpoint: "/seed/pricing",
                method: axios.post,
            },
            seedTestUser: {
                endpoint: "/seed/testUser",
                method: axios.post,
            },
            seedTestUserPortfolio: {
                endpoint: "/seed/portfolio",
                method: axios.post,
            },
        };

        const responses = {};

        for (const [endpointKey, { endpoint, method }] of Object.entries(seedEndpoints)) {
            try {
                const response = await method(`http://localhost:${localPort}/api${endpoint}`);
                responses[endpointKey] = response.data;
            } catch (error) {
                responses[endpointKey] = { error: error.message };
            }
        }

        res.status(200).json(responses);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// SEED DATABASE WITH TEST USER
router.post("/testUser", async (req, res) => {
    const userModel = require("../models/userModel");

    try {
        const files = await getSeedFiles();

        let [acceptedFiles, rejectedFiles] = validateFiles("profile_", ".json", files);
        let failedImport = [];

        await Promise.all(
            acceptedFiles.map(async (file) => {
                const fileContents = await fs.readFile(`${__dirname}/../seed_data/${file}`, "utf8");
                const jsonArray = JSON.parse(fileContents);

                if (
                    jsonArray["firstName"] &&
                    jsonArray["lastName"] &&
                    jsonArray["email"] &&
                    jsonArray["password"]
                ) {
                    await userModel.create({
                        id: "TEST-USER-ID",
                        ...jsonArray,
                    });
                } else {
                    failedImport.push({
                        data: jsonArray,
                        message: "check data input",
                    });
                }
            }),
        );

        res.status(200).json({
            message: "Seed DB with user information successful.",
            addedFiles: acceptedFiles,
            failedImports: [rejectedFiles, failedImport],
            seed_location: userModel.collection.name,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//FIXME - This whole route can probably be tidied up
// SEED DATABASE WITH PORTFOLIO HISTORY INFORMATION
router.post("/portfolio", async (req, res) => {
    const portfolioModel = require("../models/portfolioModel");
    const userModel = require("../models/userModel");

    try {
        const files = await getSeedFiles();
        let [acceptedFiles] = validateFiles("portfolio", ".json", files);
        let failedImport = [];

        await Promise.all(
            acceptedFiles.map(async (file) => {
                const fileContents = await fs.readFile(`${__dirname}/../seed_data/${file}`, "utf8");
                const jsonArray = JSON.parse(fileContents);

                await Promise.all(
                    Object.keys(jsonArray).map(async (userEmail) => {
                        const userProfile = await userModel.findOne({
                            email: userEmail,
                        });

                        Object.keys(jsonArray[userEmail]).map(async (stock) => {
                            jsonArray[userEmail][stock].map(async (transaction) => {
                                if (
                                    transaction["action"] &&
                                    transaction["date"] &&
                                    transaction["price"] &&
                                    transaction["amount"]
                                ) {
                                    await portfolioModel.create({
                                        userId: userProfile.id,
                                        stockId: stock,
                                        action: transaction["action"],
                                        date: new Date(transaction["date"]),
                                        price: transaction["price"],
                                        amount: transaction["amount"],
                                    });
                                } else {
                                    failedImport.push({
                                        data: transaction,
                                        message: "check data input",
                                    });
                                }
                            });
                        });
                    }),
                );
            }),
        );

        res.status(200).json({
            message: "Seed DB with portfolio information successful.",
            addedFiles: acceptedFiles,
            failedImports: failedImport,
            seed_location: portfolioModel.collection.name,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// SEED DATABASE WITH STOCKS INFORMATION
router.post("/stocks", async (req, res) => {
    const stocksModel = require("../models/stocksModel");

    try {
        const files = await getSeedFiles();
        let [acceptedFiles, rejectedFiles] = validateFiles("stocks_", ".csv", files);
        let failedImport = [];

        await Promise.all(
            acceptedFiles.map(async (file) => {
                const jsonArray = await csvtojson().fromFile(
                    path.join(__dirname, "../seed_data/", file),
                );

                const documents = jsonArray.map((stock) => {
                    if (stock["Exchange"] && stock["Ticker"] && stock["Name"]) {
                        return {
                            id: `${stock["Exchange"]}_${stock["Ticker"]}`,
                            ...convertKeysToLowercase(stock),
                        };
                    } else {
                        failedImport.push({
                            data: stock,
                            message: "check data input",
                        });
                        return;
                    }
                });

                await stocksModel.insertMany(documents.filter(Boolean));
            }),
        );

        res.status(200).json({
            message: "Seed DB with stocks successful.",
            addedFiles: acceptedFiles,
            failedImports: [rejectedFiles, failedImport],
            seed_location: stocksModel.collection.name,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// SEED DATABASE WITH PRICING INFORMATION. DATA SEPARATED INTO COLLECTIONS BY EXCHANGE
router.post("/pricing", async (req, res) => {
    const pricingSchema = require("../models/pricingSchema");

    try {
        const files = await getSeedFiles();

        let [acceptedFiles, rejectedFiles] = validateFiles("performance_", ".csv", files);
        let failedImport = [];
        let collectionsEdited = [];

        acceptedFiles.forEach(async (file) => {
            const [, market, ticker] = file.match(/performance_(\w+)_(\w+(-\w+)?)\.csv/) || [];

            const pricingModel = mongoose.model(
                `performance-${market.toLowerCase()}`,
                pricingSchema,
            );

            collectionsEdited.push(pricingModel.collection.name);

            const jsonArray = await csvtojson().fromFile(
                path.join(__dirname, "../seed_data/", file),
            );

            const documents = jsonArray.map((stockPerformance) => {
                if (
                    stockPerformance["Date"] !== "null" &&
                    stockPerformance["Open"] !== "null" &&
                    stockPerformance["High"] !== "null" &&
                    stockPerformance["Low"] !== "null" &&
                    stockPerformance["Close"] !== "null" &&
                    stockPerformance["Adj Close"] !== "null" &&
                    stockPerformance["Volume"] !== "null"
                ) {
                    //FIXME - Use spread operator below
                    return {
                        stock: ticker,
                        date: new Date(stockPerformance["Date"]),
                        open: parseFloat(stockPerformance["Open"]),
                        high: parseFloat(stockPerformance["High"]),
                        low: parseFloat(stockPerformance["Low"]),
                        close: parseFloat(stockPerformance["Close"]),
                        adjClose: parseFloat(stockPerformance["Adj Close"]),
                        volume: parseInt(stockPerformance["Volume"]),
                    };
                } else {
                    failedImport.push({
                        data: stockPerformance,
                        message: "check data input",
                    });
                    return;
                }
            });

            await pricingModel.insertMany(documents.filter(Boolean));
        });

        res.status(200).json({
            message: "Seed DB with stock performance successful",
            addedFiles: acceptedFiles,
            failedImport: [rejectedFiles, failedImport],
            seed_location: [...new Set(collectionsEdited)],
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
