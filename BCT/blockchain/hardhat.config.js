require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, RPC_URL } = process.env;

const networks = {
    localhost: {
        url: "http://127.0.0.1:8545"
    }
};

if (PRIVATE_KEY && RPC_URL) {
    networks.custom = {
        url: RPC_URL,
        accounts: [PRIVATE_KEY]
    };
}

module.exports = {
    solidity: "0.8.24",
    networks
};