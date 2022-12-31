const express = require("express");
const cors = require('cors');
var bodyParser = require('body-parser');

var app = express();

require('dotenv').config()

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());


const router = require('./src/router');
const { calculatePoints, claimAllPoints, getMyStakedNfts, demo } = require("./src/stake/StakeCore");
const { getBalance } = require("./src/info/Balance");
const { getOffers } = require("./src/info/SyncCollections");

//init server
app.listen(process.env.PORT || 3000, async () => {
    console.log("Server running on port 3000");
    // await calculatePoints()
    // await demo()
    // await getBalance('stars17y9ysn4uwusc0qv0d48wtc5rf4gnu6mqvjpvg9')
    // await getOffers('1515','stars1xy930u7nzynzzeld2erved4rtdkzrleqt9jr2fvkxn3d6ct4s5xs3lynaj')
});

///validate cors
app.use(cors({
    origin: '*'
}));

app.use("/api", router)

app.use("/cron", async (req, res, next) => {
    try {
        await calculatePoints()
        res.send('OK')
    } catch (error) {
        res.send('ERROR')
    }
})

app.use("/", async (req, res, next) => {
    res.status(200).json({
        message: 'Welcome to Owlies Core',
        version: '0.0.1'
    });
})


