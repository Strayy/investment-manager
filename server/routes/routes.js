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

//TODO - Update stock price data endpoint to return from db
// RETURN STOCK PRICE DATA
router.get("/getData/:ticker", async (req, res) => {
    try {
        const jsonData = await csvToJson().fromFile(
            `./data/${req.params.ticker}.csv`
        );
        res.send(JSON.stringify(jsonData));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// TODO - Integrate into database/seed files until branding API is connected
// RETURN COMPANY INFORMATION
router.get("/getCompanyData/", async (req, res) => {
    res.send(
        JSON.stringify({
            TSLA: {
                ticker: "TSLA",
                name: "Tesla",
                color: "#cc0000",
                companyLogo:
                    "https://asset.brandfetch.io/id2S-kXbuK/iduZOzPw94.png",
                companyWebsite: "https://tesla.com/",
            },
            MSFT: {
                ticker: "MSFT",
                name: "Microsoft",
                color: "#0067b8",
                companyLogo:
                    "https://asset.brandfetch.io/idchmboHEZ/id0K98Gag1.png",
                companyWebsite: "https://microsoft.com/",
            },
            AAPL: {
                ticker: "AAPL",
                name: "Apple",
                color: "#0066CC",
                companyLogo:
                    "https://asset.brandfetch.io/idnrCPuv87/id3SVF6ez4.png",
                companyWebsite: "https://apple.com/",
            },
        })
    );
});

module.exports = router;
