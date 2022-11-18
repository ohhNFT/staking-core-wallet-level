const express = require("express");
const cors = require('cors');


var app = express();

//init server
app.listen(process.env.PORT || 3000, async () => {
    console.log("Server running on port 3000");
});

///validate cors
app.use(cors({
    origin: '*'
}));

app.use("/",async (req, res, next) =>{
    res.send('Welcome to Owlies Core');
})