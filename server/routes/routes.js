const express = require("express");
const router = express.Router();
router.use(express.json());
const csvToJson = require("csvtojson");

// TODO - Create endpoint for seeding db with all test information
// SEED DATABASE WITH ALL INFO
router.get("/seedDB/all", async (req, res) => {
    try {
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// TODO - Create endpoint for seeding db with pricing information
// SEED DATABASE WITH PRICING INFORMATION
// const pricingRouter = require("./seed/stocks");
// router.get("/seed/pricing", pricingRouter);

// TODO - Create endpoint for seeding db with stocks information
// SEED DATABASE WITH STOCKS INFORMATION
// const stocksRouter = require("./seed/stocks");
// router.get("/seed/stocks/", stocksRouter);

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
