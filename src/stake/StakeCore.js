const { getClient, getSignedClient } = require('../helpers/ChainHelper');
const { StatusCodes } = require('http-status-codes');
const { getConnection } = require('../helpers/DBHelper');
const { getCollectionBySg721 } = require('../../data/collections');
const moment = require('moment');
const e = require('express');

const markForStake = async (params) => {

    try {
        const { sender, token_id, collection } = params


        let values = []
        for (token of token_id.split(',')) {
            values.push([sender, token, collection, 0]);
        }

        const pool = await getConnection();

        const result = await pool.query('INSERT INTO mark_stake (sender,token_id,collection,status) VALUES ?',
            [values]);

        const { affectedRows } = result[0];

        return {
            data: [],
            status: StatusCodes.OK,
            message: (affectedRows > 1) ? 'Ok' : 'NOT_OK'
        }

    } catch (error) {
        console.log('error-mark-stake', error);
        return {
            data: [],
            status: StatusCodes.NOT_ACCEPTABLE,
            message: 'Something went wrong.Please try again later'
        }

    }
}

const initiateStake = async (params) => {
    try {

        //TODO :Check if it is already staked

        const { sender, token_id, collection } = params

        const pool = await getConnection();
        const client = await getClient();

        let query = `SELECT *
        FROM
            mark_stake
        WHERE
            sender = '${sender}' AND
            token_id = ${parseInt(token_id)} AND
            collection = '${collection}' AND
            STATUS = 0
        ORDER BY
            mark_stake.id DESC
        LIMIT 0, 1`;

        const result = await pool.query(query, []);

        if (result[0].length === 0) {
            return {
                data: [],
                status: StatusCodes.BAD_REQUEST,
                message: 'Please mark this for stake before initiate the stake'
            }
        } else {

            let markDetails = result[0];


            //check the current owner

            const tokenInfo = await client.queryContractSmart(collection, {
                all_nft_info: { token_id: `${token_id}` },
            });

            if (tokenInfo) {

                const { owner } = tokenInfo.access;

                if (owner === process.env.Staking_Wallet) {
                    //token is under owlies wallet
                    //get the collection point details
                    let collectionDetails = await getCollectionBySg721(collection);
                    if (collectionDetails) {
                        //save the details
                        let insertQuery = `INSERT INTO stakes (collection,owner,token_id,rate,status,timestamp,last_point_added) VALUES (?,?,?,?,?,?,?)`;

                        let timestamp = moment().valueOf();
                        // let rd= moment.utc(timestamp).format('dddd, MMMM Do, YYYY h:mm:ss A')

                        //TODO : Get current rates
                        let rate = 0.005;

                        const insertResult = await pool.query(insertQuery,
                            [
                                collectionDetails.sg721,
                                markDetails[0].sender,
                                token_id,
                                rate,
                                1,
                                timestamp,
                                timestamp
                            ]);

                        //update the mark stake
                        let update = "UPDATE mark_stake SET status=1 WHERE id=?";
                        await pool.query(update, [markDetails.id])

                        //add to the my activity
                        await updateMyActivities('stake',
                            markDetails[0].sender,
                            collectionDetails.sg721,
                            token_id,
                            "",
                            timestamp);


                        return {
                            data: {
                                collection: collectionDetails.sg721,
                                owner: markDetails[0].sender,
                                rate,
                                staked_at: timestamp,
                                token_id
                            },
                            status: StatusCodes.OK,
                            message: (insertResult[0].affectedRows === 1) ? 'STAKE_OK' : 'STAKE_NOT_OK'
                        }

                    } else {
                        //collection not found
                        return {
                            data: [],
                            status: StatusCodes.BAD_REQUEST,
                            message: 'Staking not allowed for this collection.'
                        }
                    }
                } else {
                    return {
                        data: [],
                        status: StatusCodes.BAD_REQUEST,
                        message: 'Token is not owned by Owlies.'
                    }
                }
            } else {
                //error token
                return {
                    data: [],
                    status: StatusCodes.BAD_REQUEST,
                    message: 'Token or Collection not found on the blockchain'
                }

            }
        }

    } catch (error) {
        console.log('error-initiate-stake', error);
        return {
            data: [],
            status: StatusCodes.NOT_ACCEPTABLE,
            message: 'Something went wrong.Please try again later'
        }
    }
}

const calculatePoints = async () => {
    try {
        const pool = await getConnection();

        let result = await pool.query('SELECT * from stakes', []);

        let stakes = result[0];

        for (let nft of stakes) {
            // get the diff
            try {
                let now = moment();
                let timestamp = now.valueOf();
                let last_point_added = moment(parseInt(nft.last_point_added));

                let diff = now.diff(last_point_added, 'days', true);

                let new_points = parseFloat(nft.rate) * diff

                let currentPoints = parseFloat(nft.points) + parseFloat(new_points.toFixed(6));

                let update = "UPDATE stakes SET points=?,last_point_added=? WHERE id=?";

                await pool.query(update, [currentPoints, timestamp, nft.id])

            } catch (error) {
                console.log('error update points', error);
            }

        }

    } catch (error) {
        console.log(error);
    }
}

const claimAllPoints = async (owner) => {
    try {
        //get the staked nfts
        const pool = await getConnection();

        const result = await pool.query(`SELECT * from stakes WHERE owner=?`, [owner]);

        if (result[0].length === 0) {
            return {
                data: [],
                status: StatusCodes.OK,
                message: 'No_Staked_Tokens_Found'
            }
        } else {

            //get the account details
            const resultOwner = await pool.query(`SELECT * from owners WHERE stars_address=?`, [owner]);

            if (resultOwner[0].length === 0) {
                return {
                    data: [],
                    status: StatusCodes.OK,
                    message: 'No_Account_Found'
                }
            }
            //get the points from all tables
            let accountOwner = resultOwner[0][0];

            let totalPoints = 0;

            for (let token of result[0]) {
                totalPoints += token.points
            }

            //update stake table table
            const resUpdateStakes = await pool.query(`UPDATE stakes SET points=0 WHERE owner=?`, [owner]);

            //update user table
            const resUpdateOwnersPoints = await pool.query(`UPDATE owners SET points=? WHERE stars_address=?`, [(totalPoints + accountOwner.points), owner]);

            //add to the logs
            let timestamp = moment().valueOf();
            await updateMyActivities('claim_all_points', owner, 'all', 'all',
                `${(totalPoints + accountOwner.points)} points claimed.`, timestamp)

            return {
                data: {
                    point_claimed: totalPoints
                },
                status: StatusCodes.OK,
                message: 'OK'
            }
        }



    } catch (error) {
        console.log('error-claim-points', error);
        return {
            data: [],
            status: StatusCodes.NOT_ACCEPTABLE,
            message: 'Something went wrong.Please try again later'
        }
    }
}

const claimSingleNftPoints = async (params) => {
    try {
        const { sender, token_id, collection } = params

        const pool = await getConnection();

        //get the details
        const result = await pool.query(`SELECT * from stakes WHERE owner=? AND token_id=? AND collection=?`,
            [sender, token_id, collection]);

        if (result[0].length === 0) {
            return {
                data: [],
                status: StatusCodes.OK,
                message: 'No_Staked_Tokens_Found'
            }
        } else {

            const nftDetails = result[0][0];

            //get the account details
            const resultOwner = await pool.query(`SELECT * from owners WHERE stars_address=?`, [sender]);

            if (resultOwner[0].length === 0) {
                return {
                    data: [],
                    status: StatusCodes.OK,
                    message: 'No_Account_Found'
                }
            }
            let accountOwner = resultOwner[0][0];

            const resUpdateStakes = await pool.query(`UPDATE stakes SET points=0 WHERE owner=? AND token_id=? AND collection=?`,
                [sender, token_id, collection]);

            const resUpdateOwnersPoints = await pool.query(`UPDATE owners SET points=? WHERE stars_address=?`,
                [(nftDetails.points + accountOwner.points), sender]);

            let timestamp = moment().valueOf();
            await updateMyActivities('claim_single', sender, collection, token_id, `${(nftDetails.points + accountOwner.points)} points claimed.`, timestamp)

            return {
                data: {
                    point_claimed: nftDetails.points
                },
                status: StatusCodes.OK,
                message: 'OK'
            }
        }
    } catch (error) {
        console.log('error-claim_single-nft-points', error);
        return {
            data: [],
            status: StatusCodes.NOT_ACCEPTABLE,
            message: 'Something went wrong.Please try again later'
        }
    }
}

const unStake = async (params) => {
    try {

        const { sender, token_id, collection } = params

        const pool = await getConnection();

        //get the details
        const result = await pool.query(`SELECT * from stakes WHERE owner=? AND token_id=? AND collection=?`,
            [sender, token_id, collection]);

        if (result[0].length === 0) {
            return {
                data: [],
                status: StatusCodes.OK,
                message: 'No_Staked_Tokens_Found'
            }
        }
        //delete the record
        const deleteFromStakeRes = await pool.query(`DELETE FROM stakes WHERE owner=? AND token_id=? AND collection=?`,
            [sender, token_id, collection]);

        const nftDetails = result[0][0];

        const resultOwner = await pool.query(`SELECT * from owners WHERE stars_address=?`, [sender]);

        if (resultOwner[0].length === 0) {
            return {
                data: [],
                status: StatusCodes.OK,
                message: 'No_Account_Found'
            }
        }

        let accountOwner = resultOwner[0][0];
        let timestamp = moment().valueOf();

        //transfer nft to the owner

        const msg = {
            transfer_nft: {
                recipient: nftDetails.owner,
                token_id: `${nftDetails.token_id}`,
            },
        };

        let client = await getSignedClient()

        let resTx = await client.execute(
            process.env.Staking_Wallet,
            nftDetails.collection,
            msg,
            'auto',
            'transfer',
            []
        );


        const resUpdateUnStakes = await pool.query(`INSERT INTO unstakes (owner,token_id,collection,rate,timestamp,last_point_added,points,points_claimed,tx) VALUES(?,?,?,?,?,?,?,?,?)`,
            [
                sender,
                token_id,
                collection,
                nftDetails.rate,
                timestamp,
                nftDetails.last_point_added,
                0,
                nftDetails.points,
                resTx.transactionHash
            ]);

        const resUpdateOwnersPoints = await pool.query(`UPDATE owners SET points=? WHERE stars_address=?`,
            [(nftDetails.points + accountOwner.points), sender]);

        await updateMyActivities('unstake', sender, collection, token_id, `${(nftDetails.points + accountOwner.points)} points claimed and unstaked.`, timestamp)

        return {
            data: {
                point_claimed: nftDetails.points,
                unstaked: {
                    collection,
                    token_id,
                    tx: resTx.transactionHash
                }
            },
            status: StatusCodes.OK,
            message: 'OK'
        }

    } catch (error) {
        console.log('error-unStake', error);
        return {
            data: [],
            status: StatusCodes.NOT_ACCEPTABLE,
            message: 'Something went wrong.Please try again later'
        }
    }
}

const getMyStakedNfts = async (owner) => {
    try {

        const pool = await getConnection();

        let result = await pool.query('SELECT * from stakes WHERE owner=?', [owner]);

        if (result[0].length === 0) {
            return {
                data: [],
                status: StatusCodes.OK,
                message: 'No_Staked_Tokens_Found'
            }
        } else {
            let stakes = result[0];
            let response = []
            for (let nft of stakes) {

                let res = { ...nft };

                delete res.tx
                delete res.points_claimed
                delete res.status
                delete res.last_point_added
                delete res.points

                response.push({
                    ...res,
                    claimable_points: nft.points
                });

            }

            return {
                data: response,
                status: StatusCodes.OK,
                message: 'MY_STAKED_NFTS'
            }

        }

    } catch (error) {
        console.log('error-initiate-stake', error);
        return {
            data: [],
            status: StatusCodes.NOT_ACCEPTABLE,
            message: 'Something went wrong.Please try again later'
        }
        console.log(error);
    }
}

const updateMyActivities = async (type, owner, collection, token_id, description, timestamp) => {
    try {
        const pool = await getConnection();

        await pool.query(`INSERT INTO my_activities (type,owner,collection,token_id,description,timestamp) VALUES (?,?,?,?,?,?)`,
            [type, owner, collection, token_id, description, timestamp])
    } catch (error) {
        console.log('error put my activities', error);
    }
}

const demo = async () => {
    try {
        const msg = {
            transfer_nft: {
                recipient: 'stars17y9ysn4uwusc0qv0d48wtc5rf4gnu6mqvjpvg9',
                token_id: `144`,
            },
        };

        let client = await getSignedClient()

        let resTx = await client.execute(
            process.env.Staking_Wallet,
            'stars1ca29gcvk6n77neqw775ke6pqg38jzptaqnuwvpkktzc70ncdd39sfmeuwh',
            msg,
            'auto',
            'unstake',
            []
        );

        console.log(resTx);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    markForStake,
    initiateStake,
    calculatePoints,
    claimAllPoints,
    getMyStakedNfts,
    claimSingleNftPoints,
    unStake,
    demo
}