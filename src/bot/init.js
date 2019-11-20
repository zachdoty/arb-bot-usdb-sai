require('dotenv').config();
import Web3 from "web3";
import HDWalletProvider from "truffle-hdwallet-provider";

import { config } from './config';
import { checkTrade } from './trade';

let run = () => {

    let provider = new HDWalletProvider(
        config.MNEMONIC,
        `https://${config.NETWORK}.infura.io/v3/${config.INFURA_KEY}`
    );

    let web3 = new Web3(provider);
    web3.eth.defaultAccount = config.DEFAULT_ADDRESS;

    let ws_provider = new Web3.providers.WebsocketProvider(`wss://${config.NETWORK}.infura.io/ws/v3/${config.INFURA_KEY}`);
    let web3_WS = new Web3(ws_provider);

    console.group("\nRunning bot...");

    checkTrade(null, web3);

    console.groupEnd();

}

export { run };
