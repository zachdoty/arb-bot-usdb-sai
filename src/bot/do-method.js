let request = require("request");
let currentGas = {
    value: 0,
    value2: 0,
};

let fetchGas = async () => {
    try {
        request("https://ethgasstation.info/json/ethgasAPI.json", (error, response, body) => {
            if (!error && response.statusCode == 200) {
                let json = JSON.parse(body);
                currentGas.value = json.average / 10;
                currentGas.value2 = json.fastest / 10;
                // currentGas.value = json.average;
            }
        });
    } catch (e) {}
    setTimeout(fetchGas, 60000 * 1);
};

fetchGas();

let cancelTx = async (_web3) => {
    let gasPrice = currentGas.value2 * 1e9;
    const nonce = await _web3.eth.getTransactionCount(_web3.eth.defaultAccount);
    await _web3.eth.sendTransaction({
        from: _web3.eth.defaultAccount,
        to: _web3.eth.defaultAccount,
        data: "",
        gasPrice: gasPrice,
        gas: 2100000,
        value: 0,
        nonce: nonce
    });
};

let doMethod2 = (account, method, gas, gasPrice) => {
    if (!gasPrice) gasPrice = currentGas.value * 1e9;

    return method.send({
        from: account,
        gas: gas,
        gasPrice: gasPrice
    });
};

let doMethod = (account, method, gas, gasPrice, setHash) => {
    if (!gasPrice) gasPrice = currentGas.value * 1e9;

    return new Promise((resolve, reject) => {
        method.send(
            {
                from: account,
                gas: gas,
                gasPrice: gasPrice
            },
            (error, transactionHash) => {
                if (!error) {
                    resolve({
                        success: true,
                        hash: transactionHash
                    });
                } else {
                    reject({
                        success: false,
                        error: error
                    });
                }
            }
        );
    });
};

export { doMethod, doMethod2, cancelTx };
