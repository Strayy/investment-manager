const express = require("express");
const router = express.Router();

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

// TODO - Create endpoint for deleting old seed collections
router.delete("/seed/deleteOld", async (req, res) => {
    try {
        console.log("DELETING");
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// TODO - Create endpoint for seeding db with all test information
// SEED DATABASE WITH ALL INFO
router.post("/seed/all", async (req, res) => {
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
                            id: `${stock["Exchange"]}.${stock["Ticker"]}`,
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

// TODO - Create endpoint for seeding db with pricing information
// SEED DATABASE WITH PRICING INFORMATION
router.post("/pricing", async (req, res) => {
    try {
        res.semd(true);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
