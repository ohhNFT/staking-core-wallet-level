const express = require('express');
const router = express.Router();


//load routers
const infoRouter = require('./info/router');


router.use("/",async (req, res, next) =>{
    res.send('Welcome to Owlies Core API');
})

router.use('/info',infoRouter);

module.exports = router;
