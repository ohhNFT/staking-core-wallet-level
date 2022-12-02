const Collections = require("../../data/collections");
const { getClient } = require("../helpers/ChainHelper");
const { getMetadata } = require("../helpers/MetadatahHelper");

const axios = require('axios').default

const getCollectionDetails = async () => {
    try {
        let collections = []

        for (const [key, value] of Object.entries(Collections)) {

            collections.push({
                ...value,
                collection_id: key
            });

        }

        return collections;

    } catch (error) {
        console.log(error);
        throw error
    }
}

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

                        let metadata = await getMetadata(key, token)

                        nfts.push(metadata)
                    }

                }

                tokenBasicInfo.push({
                    collection: key,
                    tokens,
                    nft_details: nfts
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
    getCollectionDetails,

}