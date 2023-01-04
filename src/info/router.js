const express = require('express');
const { processResponse } = require('../helpers/ResponseHelper');
const { getBalance } = require('./Balance');
const { syncOmniFlixNFTs } = require('./Omniflix');
const { getProfileInfo, getCollectionDetails, getOffers } = require('./SyncCollections');
const { getStakingInfo } = require('./SyncStakingInfo');
const router = express.Router();


//get all collection details

router.get('/all-owlies-collections', async (req, res, next) => {
    try {

        const collections = await getCollectionDetails();

        return res.status(200).json(processResponse('All Owlies collection details', collections));

    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
    }
})

router.get('/wallet-balance', async (req, res, next) => {
    try {

        const { address } = req.query

        //validate address
        if (!address) {
            return res.status(400).json(processResponse('', 'Address not valid', null));
        }

        const balance = await getBalance(address);

        return res.status(200).json(processResponse('Account Balance', balance));

    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
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

        return res.status(200).json(processResponse('Staking Tokonomics', stakingInfo));

    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
    }
})

router.get('/offers', async (req, res, next) => {
    try {

        const { token_id, collection } = req.query

        //validate address
        if (!collection) {
            return res.status(400).json(processResponse('', 'Collection not valid', null));
        }

        if (!token_id) {
            return res.status(400).json(processResponse('', 'Token Id not valid', null));
        }

        const offers = await getOffers(token_id,collection);

        return res.status(200).json(processResponse('Offers', offers));

    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
    }
})

router.get('/sync-omniflix-collections', async (req, res, next) => {
    try {

        const {address } = req.query

        //validate address
        if (!address) {
            return res.status(400).json(processResponse('', 'Address not valid', null));
        }

        const nfts = await syncOmniFlixNFTs(address);

        return res.status(200).json(processResponse('Omniflix NFTS', nfts));

    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
    }
})

module.exports = router;