import {
    config
} from './config';
import {
    doMethod,
    cancelTx
} from "./do-method";
import {
    display as displayTokenBalances
} from "./balances";
import {
    abi as SmartTokenABI
} from "../../contracts/SmartToken.json";
import {
    abi as BancorGasPriceLimitABI
} from "../../contracts/BancorGasPriceLimit.json";
import {
    abi as BancorConverterABI
} from "../../contracts/BancorConverter.json";
import {
    abi as NewBancorConverterABI
} from "../../new-contracts/BancorConverter.json";

import {
    sendMessage as botSendMessage
} from "./telegram-bot";

import { checkAllowance } from './allowance';

let doTrade = async (_web3, _direction, DAIToken, USDToken, BancorGasPriceLimit, USDBNTConverter, DAIBNTConverter) => {

    try {
        if (_direction == 'USD_DAI') {
            // check if allowance was met
            let allowance = await USDToken.methods.allowance(_web3.eth.defaultAccount, USDBNTConverter.options.address).call() / 1e18;
            console.log('- Allowance: ', allowance)
            if (allowance >= Number(config.TRADE_VALUE)) {
                // do trade from USD to DAI
                console.log('- Did a trade from USD to DAI');
                botSendMessage(`Message\n\n- Did a trade from USD to DAI`);
                let gasPrice = await BancorGasPriceLimit.methods.gasPrice().call();
                let method = USDBNTConverter.methods.quickConvert(
                    [
                        config.USD_ADDRESS,
                        config.USDBNT,
                        config.BNT_ADDRESS,
                        config.DAIBNT,
                        config.DAI_ADDRESS
                    ],
                    _web3.utils.toWei(config.TRADE_VALUE, 'ether'),
                    _web3.utils.toWei(config.TRADE_VALUE, 'ether'),
                );
                let gas = await method.estimateGas({from: _web3.eth.defaultAccount});
                let res = await doMethod(_web3.eth.defaultAccount, method, (gas+(gas/2)), gasPrice, true);
                if (res.success) {
                    let result = null;
                    let status = null;
                    do {
                        result = await _web3.eth.getTransactionReceipt(res.hash);
                        if (result) status = result.status;
                    } while (status === null);
                    
                    if(status === true) {
                        console.group('\nTrade Result')
                        console.log(`- Hash: ${result.transactionHash}`);
                        const eventsDAIBNT = await DAIBNTConverter.getPastEvents('allEvents', {fromBlock: result.blockNumber});
                        const myEventsDAIBNT = eventsDAIBNT.filter(event => {return event.event === 'Conversion' && event.transactionHash === result.transactionHash});
                        
                        const eventsUSDBNT = await USDBNTConverter.getPastEvents('allEvents', {fromBlock: result.blockNumber});
                        const myEventsUSDBNT = eventsUSDBNT.filter(event => {return event.event === 'Conversion' && event.transactionHash === result.transactionHash});
                        
                        let msg = `Message: Trade Result\n\n- Hash: ${result.transactionHash}\n`;
                            msg += `- Amount: ${Number(myEventsUSDBNT[0].returnValues._amount) / 1e18}\n`;
                            msg += `- Return: ${Number(myEventsDAIBNT[0].returnValues._return) / 1e18}\n`;

                            console.log(`- Amount: ${Number(myEventsUSDBNT[0].returnValues._amount) / 1e18}`);
                            console.log(`- Return: ${Number(myEventsDAIBNT[0].returnValues._return) / 1e18}`);
                        

                        console.groupEnd();
                        botSendMessage(msg);
                    }
                }
            } else {
                console.log('- USD token allowance error.');
                botSendMessage(`Error\n\n- USD token allowance error.`);
            }
        }

        if (_direction == 'DAI_USD') {

            // check if allowance was met
            let allowance = await DAIToken.methods.allowance(_web3.eth.defaultAccount, DAIBNTConverter.options.address).call() / 1e18;
            console.log('- Allowance: ', allowance)
            if (allowance >= Number(config.TRADE_VALUE)) {
                // do trade DAI to USD
                console.log('- Did a trade from DAI to USD');
                botSendMessage(`Message\n\n- Did a trade from DAI to USD`);

                let gasPrice = await BancorGasPriceLimit.methods.gasPrice().call();
                let method = DAIBNTConverter.methods.quickConvert(
                    [
                        config.DAI_ADDRESS,
                        config.DAIBNT,
                        config.BNT_ADDRESS,
                        config.USDBNT,
                        config.USD_ADDRESS,
                    ],
                    _web3.utils.toWei(config.TRADE_VALUE, 'ether'),
                    _web3.utils.toWei(config.TRADE_VALUE, 'ether'),
                );
                let gas = await method.estimateGas({from: _web3.eth.defaultAccount});
                let res = await doMethod(_web3.eth.defaultAccount, method, (gas+(gas/2)), gasPrice, true);
                if (res.success) {
                    let result = null;
                    let status = null;
                    do {
                        result = await _web3.eth.getTransactionReceipt(res.hash);
                        if (result) status = result.status;
                    } while (status === null);
                    if(status === true) {
                        console.group('\n Trade Result')
                        console.log(`- Hash: ${result.transactionHash}`);
                        const eventsDAIBNT = await DAIBNTConverter.getPastEvents('allEvents', {fromBlock: result.blockNumber});
                        const myEventsDAIBNT = eventsDAIBNT.filter(event => {return event.event === 'Conversion' && event.transactionHash === result.transactionHash});
                        
                        const eventsUSDBNT = await USDBNTConverter.getPastEvents('allEvents', {fromBlock: result.blockNumber});
                        const myEventsUSDBNT = eventsUSDBNT.filter(event => {return event.event === 'Conversion' && event.transactionHash === result.transactionHash});
                        
                        let msg = `Message: Trade Result\n\n- Hash: ${result.transactionHash}\n`;
                            msg += `- Amount: ${Number(myEventsDAIBNT[0].returnValues._amount) / 1e18}\n`;
                            msg += `- Return: ${Number(myEventsUSDBNT[0].returnValues._return) / 1e18}\n`;

                            console.log(`- Amount: ${Number(myEventsDAIBNT[0].returnValues._amount) / 1e18}`);
                            console.log(`- Return: ${Number(myEventsUSDBNT[0].returnValues._return) / 1e18}`);
                        
                        console.groupEnd();
                        botSendMessage(msg);
                    }
                }
            } else {
                console.log('- DAI token allowance error.');
                botSendMessage(`Error\n\n- DAI token allowance error.`);
            }
        }

        await displayTokenBalances(_web3);
    } catch(e) {
        if(e.includes('not mined within750 seconds')) {
            await cancelTx(_web3);
        }
    }
}

let checkTrade = async (_name, _web3) => {


    let BancorGasPriceLimit = new _web3.eth.Contract(BancorGasPriceLimitABI, config.GASPRICELIMIT);

    let DAIToken = new _web3.eth.Contract(SmartTokenABI, config.DAI_ADDRESS);
    let USDToken = new _web3.eth.Contract(SmartTokenABI, config.USD_ADDRESS);

    let USDBNTConverter = new _web3.eth.Contract(NewBancorConverterABI, config.USDBNT_ADDRESS);
    let DAIBNTConverter = new _web3.eth.Contract(BancorConverterABI, config.DAIBNT_ADDRESS);

    let getReturn_DAI = async () => {
        let returnBNT = await USDBNTConverter.methods.getReturn(config.USD_ADDRESS, config.BNT_ADDRESS, _web3.utils.toWei(config.TRADE_VALUE, 'ether')).call();
        let returnDAI = await DAIBNTConverter.methods.getReturn(config.BNT_ADDRESS, config.DAI_ADDRESS, returnBNT[0]).call();

        return returnDAI / 1e18;
    }

    let getReturn_USD = async () => {
        let returnBNT = await DAIBNTConverter.methods.getReturn(config.DAI_ADDRESS, config.BNT_ADDRESS, _web3.utils.toWei(config.TRADE_VALUE, 'ether')).call();
        let returnUSD = await USDBNTConverter.methods.getReturn(config.BNT_ADDRESS, config.USD_ADDRESS, returnBNT).call();

        return returnUSD[0] / 1e18;
    }

    try {
        let returnUSD = await getReturn_USD();
        let returnDAI = await getReturn_DAI();
        let balanceDAI = Number(await DAIToken.methods.balanceOf(_web3.eth.defaultAccount).call())/1e18;
        let balanceUSD = Number(await USDToken.methods.balanceOf(_web3.eth.defaultAccount).call())/1e18;

        console.group('\nChecking trade...');
            console.log(`- ReturnDAI: ${returnDAI}`);
            console.log(`- ReturnUSD: ${returnUSD}`);
            console.log(`- ReturnDAI > TRADE_VALUE: ${(returnDAI > Number(config.TRADE_VALUE))}`);
            console.log(`- ReturnUSD > TRADE_VALUE: ${(returnUSD > Number(config.TRADE_VALUE))}`);
        console.groupEnd();

        if (returnDAI > Number(config.TRADE_VALUE)) {
            if(balanceUSD > Number(config.TRADE_VALUE)) {
                // do trade from USD to DAI
                await doTrade(_web3, 'USD_DAI', DAIToken, USDToken, BancorGasPriceLimit, USDBNTConverter, DAIBNTConverter);
            } else {
                console.log(`- USD Balance Low: ${balanceUSD}`);
                botSendMessage(`- USD Balance Low: ${balanceUSD}`);
            }
        } else {
            if (returnUSD > Number(config.TRADE_VALUE)) {
                if(balanceDAI > Number(config.TRADE_VALUE)) {
                    // do trade DAI to USD
                    await doTrade(_web3, 'DAI_USD', DAIToken, USDToken, BancorGasPriceLimit, USDBNTConverter, DAIBNTConverter);
                } else {
                    console.log(`- DAI Balance Low: ${balanceDAI}`);
                    botSendMessage(`- DAI Balance Low: ${balanceDAI}`);
                }
            }
        }

    } catch (err) {
        console.log('- Error while checking trade: ', err.message ? err.message : err);
        botSendMessage('- Error while checking trade: ' + err.message ? err.message : err);
    }

    
    setTimeout(() => {
        checkTrade(_name, _web3);
    }, 1000 * 30);

}

export {
    checkTrade
};