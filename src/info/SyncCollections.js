const Collections = require("../../data/collections");
const { getClient } = require("../helpers/ChainHelper");
const { getMetadata } = require("../helpers/MetadatahHelper");

const axios = require('axios').default

const getProfileInfo = async (address) => {
    try {

        const client = await getClient();

        const tokenBasicInfo = []

        for (const [key, value] of Object.entries(Collections)) {
            //get all collection information
            try {

                const { tokens } = await client.queryContractSmart(value.sg721, {
                    tokens: { owner: address, limit: 30 }
                });

                let nfts = []

                for (let token of tokens) {

                    if (value.CID) {
                        console.log('getting data');

                        let url = (`${process.env.IPFS_Gateway}/${value.CID}/${token}`);

                        let metadata = await getMetadata(value.CID, token)

                        nfts.push(metadata)
                    }

                }

                tokenBasicInfo.push({
                    collection: key,
                    tokens,
                    details: nfts
                })

            } catch (error) {
                console.log(error);
            }
        }

        return tokenBasicInfo;


    } catch (error) {
        throw error;
    }
}


module.exports = {
    getProfileInfo,

}