const { getClientFromRpc, chains, convertAdd } = require("../helpers/ChainHelper");
const { getConnection } = require("../helpers/DBHelper");

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

        let pool = await getConnection();

        let stars_address = await convertAdd(address,'stars');

        const resultOwner = await pool.query(`SELECT * from owners WHERE stars_address=?`, [stars_address]);

        if(resultOwner[0].length != 0){
            let accountOwner = resultOwner[0][0];

            balances.push({
                name : 'STARDUST',
                balance : accountOwner.points
            });
            console.log('from acc');
        }else{
            //create new account
            await pool.query(`INSERT INTO owners (stars_address) VALUES (?)`, [stars_address]);
            
            balances.push({
                name : 'STARDUST',
                balance : 0
            });
            console.log('new acc added');
        }

        return balances
    } catch (error) {
        throw error;
    }
}

module.exports ={
    getBalance
}