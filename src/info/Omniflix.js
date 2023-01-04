const axios = require('axios').default

const syncOmniFlixNFTs = async (address) =>{
    try {

        let nfts = []

        //check the owned nfts
        let collectionDenom = 'onftdenomfa7be115410e464ca83f3138283e6516'
        let url =  `https://rest.omniflix.network/omniflix/onft/v1beta1/onfts/${collectionDenom}/${address}`;

        let ownedNFTs = await axios.get(url);

        if(ownedNFTs.data.collections.length > 0){

            const {onfts,denom} = ownedNFTs.data.collections[0];

            onfts.map(nft =>{

                let metadata = JSON.parse(nft.data)
                let data = nft.metadata

                nfts.push({
                    metadata,
                    name : data.name,
                    media : data.media_uri,
                    collection : denom.name,
                    onft_id : nft.id,
                    chain : 'omniflix'
                })
            })
        }


        //check the listed nfts

        let listedNFTUrl = `https://data-api.omniflix.studio/listings?owner=${address}`

        let listedNFTs = await axios.get(listedNFTUrl,{
            headers: {
                'Accept-Encoding': 'application/json',
            }
        });

        if(listedNFTs.data.result.list.length > 0){
            
            let owliesNFTS = listedNFTs.data.result.list.filter(nft =>{return nft.nft.denom_id === collectionDenom})
            
            owliesNFTS.map(({nft,denom}) => {

                let metadata = JSON.parse(nft.data)

                nfts.push({
                    metadata,
                    name : nft.name,
                    media : nft.media_uri,
                    collection : denom.name,
                    onft_id : nft.id,
                    chain : 'omniflix'
                })
            })
        }
        
        return nfts;
        
    } catch (error) {
        console.log('error',error);
        throw error;
    }
}

module.exports ={
    syncOmniFlixNFTs
}