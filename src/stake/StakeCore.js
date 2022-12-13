const { getClient } = require('../helpers/ChainHelper');
const { StatusCodes } = require('http-status-codes');
const { getConnection } = require('../helpers/DBHelper');
const { getCollectionBySg721 } = require('../../data/collections');
const moment = require('moment')

const markForStake = async (params) => {

    try {
        const { sender, token_id, collection } = params

        const pool = await getConnection();

        const result = await pool.query('INSERT INTO mark_stake (sender,token_id,collection,status) VALUES (?,?,?,?)',
            [sender, token_id, collection, 0]);

        const { affectedRows } = result[0];

        return {
            data: [],
            status: StatusCodes.OK,
            message: (affectedRows === 1) ? 'Ok' : 'NOT_OK'
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
                        let insertQuery = `INSERT INTO stakes (collection,owner,token_id,rate,status,timestamp) VALUES (?,?,?,?,?,?)`;

                        let timestamp = moment.utc(moment.now()).valueOf();
                        // let rd= moment.utc(timestamp).format('dddd, MMMM Do, YYYY h:mm:ss A')

                        let rate = 0.005;

                        const insertResult = await pool.query(insertQuery,
                            [
                                collectionDetails.sg721,
                                markDetails[0].sender,
                                token_id,
                                rate,
                                1,
                                timestamp
                            ]);

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

            return {
                data: [],
                status: StatusCodes.OK,
                message: 'Done'
                // message : (affectedRows === 1) ? 'Ok' : 'NOT_OK'
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


module.exports = {
    markForStake,
    initiateStake
}