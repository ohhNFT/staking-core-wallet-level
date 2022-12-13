const {Tokonomics} = require("../../data/tokenomics");

const getStakingInfo = async () => {
    try {
        return Tokonomics;
    } catch (error) {
        console.log(error);
        throw error
    }
}

module.exports = {
    getStakingInfo
}