
const { rejects } = require('assert');
const https = require('https');
const { resolve } = require('path');

const getMetadata = async (cid, token) => {

    return new Promise((resolve, rejects) => {
        let url = `${process.env.IPFS_Gateway}/${cid}/${token}`;

        console.log(url);
        https.get(url, (resp) => {

            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(JSON.parse(data))
            });

        }).on("error", (err) => {
            rejects("Error: " + err.message)
        });
    })
}

module.exports = {
    getMetadata,
}