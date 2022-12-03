const express = require('express');
const { processResponse } = require('../helpers/ResponseHelper');
const { getProfileInfo, getCollectionDetails } = require('./SyncCollections');
const { getStakingInfo } = require('./SyncStakingInfo');
const router = express.Router();


//get all collection details

router.get('/all-owlies-collections', async (req, res, next) => {
    try {

        const collections = await getCollectionDetails();

        return res.status(200).json(processResponse('All Owlies collection details', '', collections));

    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse('', 'Error', null))
    }
})

//get nfts own by a wallet
router.get('/wallet', async (req, res, next) => {
    try {
        const { address } = req.query

        //validate address
        if (!address) {
            return res.status(400).json(processResponse('', 'Address not valid', null));
        }

        //TODO : validate stars

        const profile = await getProfileInfo(address);

        return res.status(200).json(processResponse('Profile Details', '', profile));

    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse('', 'Error', null))
    }
})

router.get('/staking-info', async (req, res, next) => {
    try {

        const stakingInfo = await getStakingInfo();

        return res.status(200).json(processResponse('Staking Tokonomics', '', stakingInfo));

    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse('', 'Error', null))
    }
})
module.exports = router;