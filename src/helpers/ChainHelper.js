const { CosmWasmClient, toBech32, fromBech32 } = require('cosmwasm')

const chains = [
    {
        name : 'Cosmos Hub',
        rpc : 'https://rpc.cosmos.omniflix.co',
        denom : 'uatom',
        display : 'ATOM',
        address_prefix : "cosmos",
    },
    {
        name : 'Osmosis',
        rpc : 'https://rpc-osmosis.omniflix.io',
        denom : 'uosmo',
        display : 'OSMO',
        address_prefix : "osmo",
    },
    {
        name : 'Chihuahua',
        rpc : 'https://rpc.chihuahua.wtf',
        denom : 'uhuahua',
        display : 'HUAHUA',
        address_prefix : "chihuahua",
    },
    {
        name : 'Juno',
        rpc : 'https://rpc-juno.itastakers.com',
        denom : 'ujuno',
        display : 'JUNO',
        address_prefix : "juno",
    },
    {
        name : 'Stars',
        rpc : 'https://rpc.stargaze-apis.com/',
        denom : 'ustars',
        display : 'STARS',
        address_prefix : "stars",
    },
]


const getRPC = () => {
    return (process.env.Env === 'test') ? process.env.Test_RPC : process.env.Main_RPC
}

const getClient = async () => {
    const client = await CosmWasmClient.connect(getRPC());
    return client;
}

const getClientFromRpc = async (rpc) => {
    const client = await CosmWasmClient.connect(rpc);
    return client;
}

const convertAdd = (addr, prefix) => {
    try {
        const { data } = fromBech32(addr);
        const starsAddr = toBech32(prefix, data);
        // wallet address length 20, contract address length 32
        if (![20, 32].includes(data.length)) {
            throw new Error('Invalid address: ' + addr + ' ' + starsAddr);
        }
        addr = starsAddr;
        return addr;
    } catch (e) {
        throw new Error('Invalid address: ' + addr + ',' + e);
    }
};

module.exports = {
    getRPC,
    getClient,
    getClientFromRpc,
    convertAdd,
    chains
}