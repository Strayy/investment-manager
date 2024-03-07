const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

router.use(bodyParser.json());

const userModel = require("../models/userModel");

// GET USER FAVOURITED STOCKS
router.get("/favourites", async (req, res) => {
    try {
        if (!req.query.userId) {
            throw new Error("No userId specified in GET request");
        }

        const data = await userModel.findOne({ id: req.query.userId });

        res.status(200).json(data.favourites);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
