const Collections = require("../../data/collections");
const { getClient } = require("../helpers/ChainHelper")


const getProfileInfo = async (address) =>{
    try {

        const client = await getClient();

        const tokenBasicInfo = []

        for (const [key, value] of Object.entries(Collections)) {
            //get all collection information
            try {
                
                const {tokens} = await client.queryContractSmart(value.sg721,{
                    tokens: { owner: address, limit: 30 }
                });

                let nfts = []

                for(let token of tokens){
                    
                    const { data } = await axios.get();
                }
                
                tokenBasicInfo.push({
                    collection : key,
                    tokens,
                })
    
            } catch (error) {
                
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