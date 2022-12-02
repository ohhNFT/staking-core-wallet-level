
const https = require('https');
const axios = require('axios');

const getMetadata = async (collection, token) => {

    //TODO : Validate token is minted or not

    const allMetadata = require(`../../metadata/${collection}.json`);

    return allMetadata[parseInt(token) - 1];

    // return new Promise((resolve, reject) => {

    //     let url = `${process.env.IPFS_Gateway}/${cid}/${token}`;

    //     const req = https.get(url, (res) => {

    //         res.setEncoding('utf8');

    //         let responseBody = '';

    //         res.on('data', (chunk) => {
    //             responseBody += chunk;
    //         });

    //         res.on('end', () => {
    //             try {
    //                 resolve(JSON.parse(responseBody));
    //             } catch (error) {
    //                 reject(error);
    //             }
    //         });
    //     });

    //     req.on('error', (err) => {
    //         reject(err);
    //     });

    //     req.write(data)
    //     req.end();
    // });
}



module.exports = {
    getMetadata,
}