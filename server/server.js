const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const csvToJson = require('csvtojson');


const mongoConnectionString = process.env.MONGO_URI;
mongoose.connect(mongoConnectionString);
const database = mongoose.connection;

// IMPORT FS
const fs = require('fs');

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Mongodb Database Successfully Connected');
})

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// RETURN STOCK PRICE DATA
app.get('/getData/:ticker', async (req, res) => {
    try {
        const jsonData = await csvToJson().fromFile(`./data/${req.params.ticker}.csv`);
        res.send(JSON.stringify(jsonData));
    } catch (err) {
        res.error(err);
    }
});

// RETURN COMPANY INFORMATION
app.get('/getCompanyData/', async (req, res) => {
    res.send(JSON.stringify({
        TSLA: {
            ticker: "TSLA",
            name: "Tesla",
            color: "#cc0000",
            companyLogo: "https://asset.brandfetch.io/id2S-kXbuK/iduZOzPw94.png",
            companyWebsite: "https://tesla.com/"
        },
        MSFT: {
            ticker: "MSFT",
            name: "Microsoft",
            color: "#0067b8",
            companyLogo: "https://asset.brandfetch.io/idchmboHEZ/id0K98Gag1.png",
            companyWebsite: "https://microsoft.com/"
        },
        AAPL: {
            ticker: "AAPL",
            name: "Apple",
            color: "#0066CC",
            companyLogo: "https://asset.brandfetch.io/idnrCPuv87/id3SVF6ez4.png",
            companyWebsite: "https://apple.com/"
        }
    }))
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});