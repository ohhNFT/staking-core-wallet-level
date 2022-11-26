const { CosmWasmClient } = require('cosmwasm')

const getRPC = () =>{
    return (process.env.Env === 'test') ?  process.env.Test_RPC : process.env.Main_RPC
}

const getClient = async () =>{
    const client = await CosmWasmClient.connect(getRPC());
    return client;
}
module.exports = {
    getRPC,
    getClient
}