const express = require("express");
const cors = require('cors');
var app = express();

require('dotenv').config()

const router = require('./src/router');

//init server
app.listen(process.env.PORT || 3000, async () => {
    console.log("Server running on port 3000");
});

///validate cors
app.use(cors({
    origin: '*'
}));

app.use("/api", router)

app.use("/", async (req, res, next) => {
    res.status(200).json({
        message : 'Welcome to Owlies Core',
        version : '0.0.1'
    });
})

