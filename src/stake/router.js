const express = require('express');
const router = express.Router();
const { processResponse } = require('../helpers/ResponseHelper');
const {markForStake, initiateStake, claimAllPoints, getMyStakedNfts, claimSingleNftPoints, unStake} = require('./StakeCore')
const {StatusCodes} = require('http-status-codes')


router.post('/mark-for-stake', async (req, res, next) => {
    try {

        const {sender,token_id,collection} = req.body
        

        //basic validations
        if (!sender) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'sender not found',
                null));
        }

        if (!token_id) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'token_id not found',
                null));
        }

        if (!collection) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'collection not found',
                null));
        }


        const response = await markForStake(req.body);

        return res.status(response.status).json(processResponse(response.message,response.data));


    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
    }
})

router.post('/initiate-stake', async (req, res, next) => {
    try {

        const {sender,token_id,collection} = req.body
        

        //basic validations
        if (!sender) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'sender not found',
                null));
        }

        if (!token_id) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'token_id not found',
                null));
        }

        if (!collection) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'collection not found',
                null));
        }


        const response = await initiateStake(req.body);

        return res.status(response.status).json(processResponse(response.message,response.data));


    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
    }
})

router.post('/unstake', async (req, res, next) => {
    try {

        const {sender,token_id,collection} = req.body
        

        //basic validations
        if (!sender) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'sender not found',
                null));
        }

        if (!token_id) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'token_id not found',
                null));
        }

        if (!collection) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'collection not found',
                null));
        }

        const response = await unStake(req.body);

        return res.status(response.status).json(processResponse(response.message,response.data));


    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
    }
})

router.post('/claim', async (req, res, next) => {
    try {

        const {sender,token_id,collection} = req.body
        

        //basic validations
        if (!sender) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'sender not found',
                null));
        }

        if (!token_id) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'token_id not found',
                null));
        }

        if (!collection) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'collection not found',
                null));
        }

        const response = await claimSingleNftPoints(req.body);

        return res.status(response.status).json(processResponse(response.message,response.data));


    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
    }
})

router.post('/claim-all', async (req, res, next) => {
    try {

        const {owner} = req.body
        

        //basic validations
        if (!owner) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'owner not found',
                null));
        }

        const response = await claimAllPoints(owner);

        return res.status(response.status).json(processResponse(response.message,response.data));


    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
    }
})

router.post('/my-stakes', async (req, res, next) => {
    try {

        const {owner} = req.body
        

        //basic validations
        if (!owner) {
            return res.status(StatusCodes.BAD_REQUEST).json(processResponse(
                'owner not found',
                null));
        }

        const response = await getMyStakedNfts(owner);

        return res.status(response.status).json(processResponse(response.message,response.data));


    } catch (error) {
        console.log(error);
        return res.status(400).json(processResponse(error.toString(), null))
    }
})

module.exports = router;