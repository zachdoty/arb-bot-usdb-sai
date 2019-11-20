
import {
    abi as SmartTokenABI
} from "../../contracts/SmartToken.json";
import { doMethod } from "./do-method";
import { config } from './config';

let checkAllowance = async (_converterAddress, _tokenAddress, _web3) => {

    let tokenContract = new _web3.eth.Contract(SmartTokenABI, _tokenAddress);
    
    let doCheckAllowance = async() => {
        try {
            let allowance = Number(await tokenContract.methods.allowance(_web3.eth.defaultAccount, _converterAddress).call());
            console.log(allowance, 'allowance')
            if(allowance == 0) {
                let method = tokenContract.methods.approve(_converterAddress, _web3.utils.toWei('1000000', 'ether'));
                await doMethod(_web3.eth.defaultAccount, method, config.GAS, null);
            }
        } catch(err) {
            console.log('\nError checking allowance', err);
        }
    }

    doCheckAllowance();

}


export { checkAllowance };