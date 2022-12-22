const express = require("express");
const cors = require('cors');
var bodyParser = require('body-parser');

var app = express();

require('dotenv').config()

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());


const router = require('./src/router');
const { calculatePoints, claimAllPoints } = require("./src/stake/StakeCore");
const { getBalance } = require("./src/info/Balance");

//init server
app.listen(process.env.PORT || 3000, async () => {
    console.log("Server running on port 3000");
    await calculatePoints()
    // await getBalance('stars17y9ysn4uwusc0qv0d48wtc5rf4gnu6mqvjpvg9')
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
        message : 'Welcome to Owlies Core',
        version : '0.0.1'
    });
})


