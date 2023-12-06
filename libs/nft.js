// Desc: web service
const ethers = require('ethers');
const globalJs = require('./global.on');

const nftBridgeAppoveAsync = async (network, account, toNetwork, collection_id) => {
    try {
        globalJs.networkSettings(network);
        const provider = new ethers.providers.JsonRpcProvider(global.rpcUrl);
        toNetwork = {
            "ethereum": "ETHEREUM",
            "cypress": "KLAYTN",
            "polygon": "POLYGON",
            "bnb": "BNBMAIN",
            "sepolia": "SEPOLIA",
            "baobab": "BAOBAB",
            "mumbai": "MUMBAI",
            "tbnb" : "BNBTEST"
        }[toNetwork];

        const erc721ConfigContract = new ethers.Contract(collection_id, global.abiERC721, provider);

        const type = (await globalJs.getNodeHomeAsync(network, toNetwork, collection_id, "nft")).type;

        const toContractAddress = type=="setup" ? global.bridgeSetupContractAddress : global.nftTransferContractAddress;

        const allowance = await erc721ConfigContract.isApprovedForAll(account, toContractAddress)
        
        console.log("allowance : " + allowance);

        if (!allowance) {
            const functionData = erc721ConfigContract.interface.encodeFunctionData('setApprovalForAll', [
                toContractAddress, true
            ]);

            const gasPrice = await provider.getGasPrice();

            const gasLimit = await provider.estimateGas({
                from: account,
                to: collection_id,
                value: "0x0",
                data: functionData
            });

            let transactionDetails;

            if (network === "bnb") {
                transactionDetails = {
                    from: account,
                    to: collection_id,
                    gas: gasLimit.toHexString(),
                    value: "0x0",
                    data: functionData
                };
            } else {
                transactionDetails = {
                    from: account,
                    to: collection_id,
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

const bridgeErc721Async = async (network, account, toNetwork, contract_address, token_id) => {
    try {
        globalJs.networkSettings(network);
        const provider = new ethers.providers.JsonRpcProvider(global.rpcUrl);
        toNetwork = {
            "ethereum": "ETHEREUM",
            "cypress": "KLAYTN",
            "polygon": "POLYGON",
            "bnb": "BNBMAIN",
            "sepolia": "SEPOLIA",
            "baobab": "BAOBAB",
            "mumbai": "MUMBAI",
            "tbnb" : "BNBTEST"
        }[toNetwork];

        const toNetworkHex = globalJs.utils_textToHex(toNetwork); // network hex로 변환

        let name = "wNFT";
        let symbol = "wNFT";

        const erc721ConfigContract = new ethers.Contract(contract_address, global.abiERC721, provider);

        try {
            const nameData = await erc721ConfigContract.name();
            name = `w${nameData}`;
        } catch (e) {
            console.log("name error", e.message);
        }

        try {
            const symbolData = await erc721ConfigContract.symbol();
            symbol = `w${symbolData}`;
        } catch (e) {
            console.log("symbol error", e.message);
        }

        const type = (await globalJs.getNodeHomeAsync(network, toNetwork, contract_address, "nft")).type;

        let functionData;
        let toContractAddress;
        if (type === "setup") {
            const bridgeSetupContract = new ethers.Contract(
                global.bridgeSetupContractAddress,
                global.abiBridgeSetup,
                provider
            );

            functionData = bridgeSetupContract.interface.encodeFunctionData('setupFromERC721', [
                toNetworkHex, name, symbol, contract_address, token_id
            ]);

            toContractAddress = global.bridgeSetupContractAddress;
        } else { // nft
            const transferContract = new ethers.Contract(
                global.nftTransferContractAddress,
                global.abiTransfer,
                provider
            );

            functionData = transferContract.interface.encodeFunctionData('moveFromERC721', [
                toNetworkHex, contract_address, token_id
            ]);

            toContractAddress = global.nftTransferContractAddress;
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

const bridgeErc1155Async = async (network, account, toNetwork, contract_address, token_id, amount) => {
    try {
        globalJs.networkSettings(network);
        const provider = new ethers.providers.JsonRpcProvider(global.rpcUrl);
        toNetwork = {
            "ethereum": "ETHEREUM",
            "cypress": "KLAYTN",
            "polygon": "POLYGON",
            "bnb": "BNBMAIN",
            "sepolia": "SEPOLIA",
            "baobab": "BAOBAB",
            "mumbai": "MUMBAI",
            "tbnb" : "BNBTEST"
        }[toNetwork];

        const toNetworkHex = globalJs.utils_textToHex(toNetwork); // network hex로 변환

        let name = "wNFT";
        let symbol = "wNFT";

        const erc1155ConfigContract = new ethers.Contract(contract_address, global.abiERC1155, provider);

        try {
            const nameData = await erc1155ConfigContract.name();
            name = `w${nameData}`;
        } catch (e) {
            console.log("name error", e.message);
        }

        try {
            const symbolData = await erc1155ConfigContract.symbol();
            symbol = `w${symbolData}`;
        } catch (e) {
            console.log("symbol error", e.message);
        }

        const type = (await globalJs.getNodeHomeAsync(network, toNetwork, contract_address, "nft")).type;

        let functionData;
        let toContractAddress;
        if (type === "setup") {
            const bridgeSetupContract = new ethers.Contract(
                global.bridgeSetupContractAddress,
                global.abiBridgeSetup,
                provider
            );

            functionData = bridgeSetupContract.interface.encodeFunctionData('setupFromERC1155', [
                toNetworkHex, name, symbol, contract_address, token_id, amount
            ]);

            toContractAddress = global.bridgeSetupContractAddress;
        } else { // nft
            const transferContract = new ethers.Contract(
                global.nftTransferContractAddress,
                global.abiTransfer,
                provider
            );

            functionData = transferContract.interface.encodeFunctionData('moveFromERC1155', [
                toNetworkHex, contract_address, token_id, amount
            ]);

            toContractAddress = global.nftTransferContractAddress;
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
    nftBridgeAppoveAsync,
    bridgeErc721Async,
    bridgeErc1155Async
};