
const express = require('express');
const router = express.Router();


//load routers
const infoRouter = require('./info/router');
const stakeRouter = require('./stake/router');

router.use('/info',infoRouter);
router.use('/stake',stakeRouter);

router.use("/",async (req, res, next) =>{
    res.send('Welcome to Owlies Core API');
})



module.exports = router;
