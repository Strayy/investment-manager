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

// CHANGE USER FAVOURITED STOCKS
router.post("/changeFavourites", async (req, res) => {
    try {
        if (!req.body.userId) {
            throw new Error("No userId specified.");
        }

        if (!req.body.stockId) {
            throw new Error("No stockId specified.");
        }

        // Get user's current favourited stocks
        const getFavourites = async () => {
            return await userModel.findOne({ id: req.body.userId });
        };

        const currentFavourites = await getFavourites();

        // Check to see if the request stock is favourited by the user
        if (currentFavourites.favourites.includes(req.body.stockId)) {
            // If favourited, remove it from the favourites array.
            await userModel
                .updateOne(
                    { id: req.body.userId },
                    {
                        $pull: { favourites: req.body.stockId },
                    },
                )
                .exec();
        } else {
            // If not favourited, add it to the favourites array.
            await userModel
                .updateOne(
                    { id: req.body.userId },
                    {
                        $addToSet: { favourites: req.body.stockId },
                    },
                )
                .exec();
        }

        // Get user's favourite stocks after update
        const updatedFavourites = await getFavourites();

        res.status(200).json(updatedFavourites.favourites);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
