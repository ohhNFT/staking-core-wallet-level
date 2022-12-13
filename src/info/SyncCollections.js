const {Collections} = require("../../data/collections");
const { getClient } = require("../helpers/ChainHelper");
const { getMetadata } = require("../helpers/MetadatahHelper");

const axios = require('axios').default

const getCollectionDetails = async () => {
    try {
        return Collections;
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

                const collection = { ...value }

                //remove CID
                delete collection.CID

                tokenBasicInfo.push({
                    collection_key: key,
                    tokens,
                    collection,
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