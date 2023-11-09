// Desc: web service
const ethers = require('ethers');
const globalJs = require('./global.on');
const connect = require('./connect');
const config = require("../config/config.json");
const BigNumber = require('bignumber.js');

const getBalance = async (network, account) => {
    globalJs.networkSettings(network);
    const provider = new ethers.providers.JsonRpcProvider(global.rpcUrl);
    let balance = await provider.getBalance(account);
    balance = ethers.utils.formatEther(balance);
    return {"result": "OK", "balance": balance.toString()};
}

const getGasPriceAsync = async (network) => {
    globalJs.networkSettings(network);
    const provider = new ethers.providers.JsonRpcProvider(global.rpcUrl);
    let gasPrice = await provider.getGasPrice();
    gasPrice = ethers.utils.formatEther(gasPrice);
    return {"result": "OK", "gasprice": gasPrice.toString()};
}

const getCoinBridgeTotalFeeAsync = async (network, toNetwork) => {
    try {
        globalJs.networkSettings(network);
        const provider = new ethers.providers.JsonRpcProvider(global.rpcUrl);

        toNetwork = {
            "ethereum": "ETHEREUM",
            "cypress": "KLAYTN",
            "polygon": "POLYGON",
            "bnb": "BNBMAIN",
            "goerli": "GOERLI",
            "baobab": "BAOBAB",
            "mumbai": "MUMBAI",
        }[toNetwork];

        if (!toNetwork) {
            throw new Error("Invalid main network type");
        }

        let networkFee = (await globalJs.getNetworkFeeAsync(network, toNetwork, "token")).networkFee;

        networkFee = ethers.utils.formatEther(networkFee);

        return {"result": "OK", "bridgeFee": networkFee.toString()};
    } catch (error) {
        return {"result": "FAIL", "error": error.toString()};
    }
}


const getBridgeTotalFeeAsync = async (network, toNetwork, collection_id, typed) => {
    try {
        globalJs.networkSettings(network);
        const provider = new ethers.providers.JsonRpcProvider(global.rpcUrl);

        toNetwork = {
            "ethereum": "ETHEREUM",
            "cypress": "KLAYTN",
            "polygon": "POLYGON",
            "bnb": "BNBMAIN",
            "goerli": "GOERLI",
            "baobab": "BAOBAB",
            "mumbai": "MUMBAI",
        }[toNetwork];

        if (!toNetwork) {
            throw new Error("Invalid main network type");
        }

        const type = (await globalJs.getNodeHomeAsync(network, toNetwork, collection_id, typed)).type;

        let networkFee = (await globalJs.getNetworkFeeAsync(network, toNetwork, type)).networkFee;

        networkFee = ethers.utils.formatEther(networkFee);

        return {"result": "OK", "bridgeFee": networkFee.toString()};
    } catch (error) {
        return {"result": "FAIL", "error": error.toString()};
    }
    
}

const getHistory = async (account, types) => {
    const connection = await connect.getConnection(config.db_mainnet_connection);

    if (!connection) {
        return [];
    }

    try {
        const typesString = types.map(type => `'${type}'`).join(',');
        const strQuery = `
            SELECT resvId, event, nhId, account, toBlock, tokenType, fromBlock, fromNet, toNet, fromHash, toHash, fromToken, toToken, fromIdx, toIdx, amount, status, value, err, date
            FROM CBRIDGE.bridgeLog
            WHERE account = '${account}'
            AND tokenType IN (${typesString})
            AND fromNet IS NOT NULL
            AND fromNet != ""
            AND toNet IS NOT NULL
            AND toNet != ""
            ORDER BY date DESC
        `;

        const [rows] = await connect.runQuery(connection, strQuery, []);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        connect.releaseConnection(connection);
    }
}

const tokenBridgeAppoveAsync = async (network, account, toNetwork, token_address, amount) => {
    try {
        globalJs.networkSettings(network);
        const provider = new ethers.providers.JsonRpcProvider(global.rpcUrl);
        toNetwork = {
            "ethereum": "ETHEREUM",
            "cypress": "KLAYTN",
            "polygon": "POLYGON",
            "bnb": "BNBMAIN",
            "goerli": "GOERLI",
            "baobab": "BAOBAB",
            "mumbai": "MUMBAI",
        }[toNetwork];

        const erc20ConfigContract = new ethers.Contract(token_address, global.abiERC20, provider);

        let decimal = 1;
        try {
            const decimalsData = await erc20ConfigContract.decimals();
            decimal = decimalsData
        } catch (e) {
            console.log("decimal error", e.message);
        }

        let totalAmount = await ethers.utils.parseUnits(amount, decimal);

        const type = (await globalJs.getNodeHomeAsync(network, toNetwork, token_address, "token")).type;

        const toContractAddress = type=="setup" ? global.bridgeSetupContractAddress : global.bridgeContractAddress;

        const allowance = await erc20ConfigContract.allowance(account, toContractAddress)

        if (allowance < totalAmount) {
            totalAmount = totalAmount.toHexString();
            const functionData = erc20ConfigContract.interface.encodeFunctionData('approve', [
                toContractAddress, totalAmount
            ]);

            const gasPrice = await provider.getGasPrice();

            const gasLimit = await provider.estimateGas({
                from: account,
                to: token_address,
                value: "0x0",
                data: functionData
            });

            let transactionDetails;

            if (network === "bnb") {
                transactionDetails = {
                    from: account,
                    to: token_address,
                    gas: gasLimit.toHexString(),
                    value: "0x0",
                    data: functionData
                };
            } else {
                transactionDetails = {
                    from: account,
                    to: token_address,
                    gasLimit: gasLimit.toHexString(),
                    value: "0x0",
                    data: functionData,
                    maxPriorityFeePerGas : globalJs.decimalToHexString(Number(global.maxPriorityFeePerGas)),
                    maxFeePerGas :gasPrice.toHexString()
                };
                
            }
            return {
                result: "OK",
                transaction : transactionDetails
            }

        } else {
            return {
                result: "OK",
                transaction : '0'
            }
        }

    } catch (error) {
        return {"result": "FAIL", "error": error.toString()};
    }
    
}

const bridgeCoinAsync = async (network, account, toNetwork, amount) => {
    try {
        globalJs.networkSettings(network);
        const provider = new ethers.providers.JsonRpcProvider(global.rpcUrl);
        toNetwork = {
            "ethereum": "ETHEREUM",
            "cypress": "KLAYTN",
            "polygon": "POLYGON",
            "bnb": "BNBMAIN",
            "goerli": "GOERLI",
            "baobab": "BAOBAB",
            "mumbai": "MUMBAI",
        }[toNetwork];

        const toNetworkHex = globalJs.utils_textToHex(toNetwork); // network hex로 변환

        const bridgeContract = new ethers.Contract(
            global.bridgeContractAddress,
            global.abiBridge,
            provider
        );

        const functionData = bridgeContract.interface.encodeFunctionData('moveFromETHER', [
            toNetworkHex
        ]);

        const totalAmount = await ethers.utils.parseUnits(amount, "ether");

        const networkFee = (await globalJs.getNetworkFeeAsync(network, toNetwork, "token")).networkFee;

        const totalFee = new BigNumber(totalAmount.toString()).plus(new BigNumber(networkFee.toString()));

        const gasPrice = await provider.getGasPrice();
        
        const gasLimit = await provider.estimateGas({
            from: account,
            to: global.bridgeContractAddress,
            value: globalJs.decimalToHexString(Number(totalFee)),
            data: functionData
        });
        
        let transactionDetails;

        if (network === "bnb") {
            transactionDetails = {
                from: account,
                to: global.bridgeContractAddress,
                gas: gasLimit.toHexString(),
                value: globalJs.decimalToHexString(Number(totalFee)),
                data: functionData
            };
        } else {
            transactionDetails = {
                from: account,
                to: global.bridgeContractAddress,
                gasLimit: gasLimit.toHexString(),
                value: globalJs.decimalToHexString(Number(totalFee)),
                data: functionData,
                maxPriorityFeePerGas : globalJs.decimalToHexString(Number(global.maxPriorityFeePerGas)),
                maxFeePerGas : gasPrice.toHexString()
            };
            
        }
        return {
            result: "OK",
            transaction : transactionDetails
        }

    } catch (error) {
        return {"result": "FAIL", "error": error.toString()};
    }
    
}

const bridgeErc20AsyncAsync = async (network, account, toNetwork, token_address, amount) => {
    try {
        globalJs.networkSettings(network);
        const provider = new ethers.providers.JsonRpcProvider(global.rpcUrl);
        toNetwork = {
            "ethereum": "ETHEREUM",
            "cypress": "KLAYTN",
            "polygon": "POLYGON",
            "bnb": "BNBMAIN",
            "goerli": "GOERLI",
            "baobab": "BAOBAB",
            "mumbai": "MUMBAI",
        }[toNetwork];

        const toNetworkHex = globalJs.utils_textToHex(toNetwork); // network hex로 변환

        let name = "wToken";
        let symbol = "wTk";
        let decimal = 1;

        const erc20ConfigContract = new ethers.Contract(token_address, global.abiERC20, provider);

        try {
            const nameData = await erc20ConfigContract.name();
            name = `w${nameData}`;
        } catch (e) {
            console.log("name error", e.message);
        }

        try {
            const symbolData = await erc20ConfigContract.symbol();
            symbol = `w${symbolData}`;
        } catch (e) {
            console.log("symbol error", e.message);
        }

        try {
            const decimalsData = await erc20ConfigContract.decimals();
            decimal = decimalsData
        } catch (e) {
            console.log("decimal error", e.message);
        }

        let totalAmount = await ethers.utils.parseUnits(amount, decimal);

        const type = (await globalJs.getNodeHomeAsync(network, toNetwork, token_address, "token")).type;

        let functionData;
        let toContractAddress;
        if (type === "setup") {
            const bridgeSetupContract = new ethers.Contract(
                global.bridgeSetupContractAddress,
                global.abiBridgeSetup,
                provider
            );

            functionData = bridgeSetupContract.interface.encodeFunctionData('setupFromERC20', [
                toNetworkHex, name, symbol, token_address, totalAmount
            ]);

            toContractAddress = global.bridgeSetupContractAddress;
        } else { // token
            const bridgeContract = new ethers.Contract(
                global.bridgeContractAddress,
                global.abiBridge,
                provider
            );

            functionData = bridgeContract.interface.encodeFunctionData('moveFromERC20', [
                toNetworkHex, token_address, token_id
            ]);

            toContractAddress = global.bridgeContractAddress;
        }

        const bridgeFee = (await globalJs.getNetworkFeeAsync(network, toNetwork, type)).networkFee;

        const gasPrice = await provider.getGasPrice();

        const gasLimit = await provider.estimateGas({
            from: account,
            to: toContractAddress,
            value: bridgeFee,
            data: functionData
        });

        let transactionDetails;

        if (network === "bnb") {
            transactionDetails = {
                from: account,
                to: toContractAddress,
                gas: gasLimit.toHexString(),
                value: globalJs.decimalToHexString(Number(bridgeFee)),
                data: functionData
            };
        } else {
            transactionDetails = {
                from: account,
                to: toContractAddress,
                gasLimit: gasLimit.toHexString(),
                value: globalJs.decimalToHexString(Number(bridgeFee)),
                data: functionData,
                maxPriorityFeePerGas : globalJs.decimalToHexString(Number(global.maxPriorityFeePerGas)),
                maxFeePerGas :gasPrice.toHexString()
            };
            
        }
        return {
            result: "OK",
            transaction : transactionDetails
        }

    } catch (error) {
        return {"result": "FAIL", "error": error.toString()};
    }
    
}

module.exports = {
    getBalance,
    getGasPriceAsync,
    getCoinBridgeTotalFeeAsync,
    getBridgeTotalFeeAsync,
    getHistory,
    tokenBridgeAppoveAsync,
    bridgeCoinAsync,
    bridgeErc20AsyncAsync
};