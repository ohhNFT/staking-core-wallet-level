const tokenomics = require("../../data/tokenomics");

const getStakingInfo = async () => {
    try {
        let stakingDetails = []
        for (const [key, value] of Object.entries(tokenomics)) {

            stakingDetails.push({
                ...value,
                collection_id: key
            });

        }

        return stakingDetails;
    } catch (error) {
        console.log(error);
        throw error
    }
}

module.exports = {
    getStakingInfo
}