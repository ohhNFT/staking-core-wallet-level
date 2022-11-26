const express = require('express');
const { processResponse } = require('../helpers/ResponseHelper');
const { getProfileInfo } = require('./SyncCollections');
const router = express.Router();


router.get('/', async (req,res,next) => {
    try {
        const { address} = req.query

        //validate address
        if(!address){
            return res.status(400).json(processResponse('','Address not valid',null));
        }
        
        //TODO : validate stars

        const profile = await getProfileInfo(address);

        return res.status(200).json(processResponse('Profile Details','',profile));

    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse('','Error',null))
    }
})

module.exports = router;
