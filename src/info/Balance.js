const { getClientFromRpc, chains, convertAdd } = require("../helpers/ChainHelper");

const getBalance = async (address) =>{
    try {
        
        // const client = await getClient();

        // const bStars = await client.getBalance(address, 'ustars');
        // const  bAtoms= await client.getBalance(address, 'uatom');
        // const  bOsmo= await client.getBalance('osmo17y9ysn4uwusc0qv0d48wtc5rf4gnu6mqs49p4x', 'uosmo');

        let balances = []
        for(let chain of chains){
            let client = await getClientFromRpc(chain.rpc);

            let add = await convertAdd(address,chain.address_prefix);

            let balance = await client.getBalance(add, chain.denom);

            console.log(balance);
            balances.push({
                name : chain.display,
                balance : balance.amount / 10**6
            })
            
        }

        return balances
    } catch (error) {
        throw error;
    }
}

module.exports ={
    getBalance
}