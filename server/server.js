const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const mongoConnectionString = `${process.env.MONGO_URI}investment-manager`;
mongoose.connect(mongoConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const database = mongoose.connection;

database.on("error", (error) => {
    console.error(error);
});

database.once("connected", () => {
    console.warn("Mongodb Database Successfully Connected");
});

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/api/test", async (req, res) => {
    try {
        res.send(true);
    } catch (err) {
        res.error(err);
    }
});

// IMPORT ROUTES
const routes = require("./routes/routes");
app.use("/api", routes);

const server = app.listen(port, () => {
    console.warn(`Server is running on port: ${port}`);
});

module.exports = { app, server };
