const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const path = require("path");
const csvtojson = require("csvtojson");
const fs = require("fs").promises;
const seedFolder = "./seed_data";

async function getSeedFiles() {
    try {
        const files = await fs.readdir(seedFolder);
        return files;
    } catch (err) {
        throw err;
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

// DELETE OLD SEED COLLECTIONS FROM MONGODB DATABASE
router.delete("/deleteOld", async (req, res) => {
    try {
        const collections = await mongoose.connection.db
            .listCollections()
            .toArray();

        const deletedCollections = [];

        const mostRecentCollections = collections.reduce(
            (currentStore, collection) => {
                const collectionCreationTime = parseInt(
                    collection.name.slice(-13)
                );
                const collectionType = collection.name.substring(
                    0,
                    collection.name.length - 14
                );

                if (
                    !currentStore[collectionType] ||
                    collectionCreationTime >
                        parseInt(currentStore[collectionType].slice(-13))
                ) {
                    currentStore[collectionType] = collection.name;
                }

                return currentStore;
            },
            {}
        );

        await Promise.all(
            collections.map(async (collection) => {
                if (
                    collection.name !=
                    mostRecentCollections[
                        collection.name.substring(
                            0,
                            collection.name.length - 14
                        )
                    ]
                ) {
                    await mongoose.connection.db.dropCollection(
                        collection.name
                    );
                    deletedCollections.push(collection.name);
                }
            })
        );

        res.status(200).json({
            message: "Successfully deleted old seed files from DB",
            recentCollections: Object.values(mostRecentCollections),
            delectedCollections: deletedCollections,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// TODO - Create endpoint for seeding db with all test information
// SEED DATABASE WITH ALL INFO
router.post("/all", async (req, res) => {
    try {
        res.send(true);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// SEED DATABASE WITH STOCKS INFORMATION
router.post("/stocks", async (req, res) => {
    const stocksModel = require("../models/stocksModel");

    try {
        const files = await getSeedFiles();
        let [acceptedFiles, rejectedFiles] = validateFiles(
            "stocks_",
            ".csv",
            files
        );
        let failedImport = [];

        await Promise.all(
            acceptedFiles.map(async (file) => {
                const jsonArray = await csvtojson().fromFile(
                    path.join(__dirname, "../seed_data/", file)
                );

                const documents = jsonArray.map((stock) => {
                    if (stock["Exchange"] && stock["Ticker"] && stock["Name"]) {
                        return {
                            id: `${stock["Exchange"]}_${stock["Ticker"]}`,
                            ticker: stock["Ticker"],
                            name: stock["Name"],
                            exchange: stock["Exchange"],
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
            })
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
    const timeNow = Date.now();

    try {
        const files = await getSeedFiles();

        let [acceptedFiles, rejectedFiles] = validateFiles(
            "performance_",
            ".csv",
            files
        );
        let failedImport = [];
        let collectionsEdited = [];

        acceptedFiles.forEach(async (file) => {
            const [, market, ticker] =
                file.match(/performance_(\w+)_(\w+(-\w+)?)\.csv/) || [];

            const pricingModel = mongoose.model(
                `performance-${market}-${timeNow}`,
                pricingSchema
            );

            collectionsEdited.push(pricingModel.collection.name);

            const jsonArray = await csvtojson().fromFile(
                path.join(__dirname, "../seed_data/", file)
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