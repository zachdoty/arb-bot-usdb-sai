import {
    sendMessage as botSendMessage
} from "./telegram-bot";
import {
    abi as SmartTokenABI
} from "../../contracts/SmartToken.json";
import { config } from './config';

let display = async (_web3) => {

    let DAIToken = new _web3.eth.Contract(SmartTokenABI, config.DAI_ADDRESS);
    let USDToken = new _web3.eth.Contract(SmartTokenABI, config.USD_ADDRESS);

    let usdBalance = await USDToken.methods.balanceOf(_web3.eth.defaultAccount).call()/1e18;
    let daiBalance = await DAIToken.methods.balanceOf(_web3.eth.defaultAccount).call()/1e18;
    console.group('\nBot token balances');
        console.log(`- USD: ${usdBalance}`);
        console.log(`- DAI: ${daiBalance}`);
        console.log('\n');
    console.groupEnd();

    let msg = `Message: Bot token balances\n\n`;
        msg += `- USD: ${usdBalance}\n`;
        msg += `- DAI: ${daiBalance}\n`;

        botSendMessage(msg);

}


export { display };