// Hide errors
const hideErrors = () => {
    document.querySelectorAll('.err_txt').forEach(element => element.style.display = 'none');
};

// Show error
const showError = (selector) => {
    document.querySelector(selector).style.display = 'block';
};

// Date Difference Calculation Function
const daysDifference = (dateString) => {
    // 입력 문자열에서 날짜 및 시간 추출
    const match = dateString.match(/(\d{4}).\s(\d{2}).\s(\d{2}).\s(오전|오후)\s(\d{2}):(\d{2}):(\d{2})/);

    if (!match) {
        return NaN; // 날짜 형식이 맞지 않으면 NaN 반환
    }

    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1; // 월은 0부터 시작하므로 1을 빼줍니다.
    const day = parseInt(match[3]);
    const period = match[4];
    let hours = parseInt(match[5]);
    const minutes = parseInt(match[6]);
    const seconds = parseInt(match[7]);

    // 오전/오후에 따라 시간 조정
    if (period === '오후' && hours < 12) {
        hours += 12;
    } else if (period === '오전' && hours === 12) {
        hours = 0;
    }

    // 날짜를 생성
    const inputDate = new Date(year, month, day, hours, minutes, seconds);
    
    // 현재 날짜 설정
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // 시간, 분, 초, 밀리초 초기화

    // 날짜 차이 계산
    const diffInMilliseconds = currentDate - inputDate;
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

    return Math.abs(Math.floor(diffInDays));
}

// Date Format Function
const getExplorer = (network, hash) => {
    switch (network) {
        case "ETHEREUM":
        case "ethereum":
            return `https://etherscan.io/tx/${hash}`;
        case "KLAYTN":
        case "cypress":
            return `https://scope.klaytn.com/tx/${hash}`;
        case "POLYGON":
        case "polygon":
            return `https://polygonscan.com/tx/${hash}`;
        case "BNBMAIN":
        case "bnb":
            return `https://bscscan.com/tx/${hash}`;
    }
}

// Get Img Url Function
const getImageUrl = (network) => {
    switch (network) {
        case "GOERLI":
        case "goerli":
        case "ETHEREUM":
        case "ethereum":
            return "/img/ethereum.png";
        case "BAOBAB":
        case "baobab":
        case "KLAYTN":
        case "cypress":
            return "/img/klaytn.png";
        case "MUMBAI":
        case "mumbai":
        case "POLYGON":
        case "polygon":
            return "/img/polygon.png";
        case "TBNB":
        case "tbnb":
        case "BNBMAIN":
        case "bnb":
            return "/img/binance.png";
    }
}

// Get Network Symbol Function
const getSymbol = (network) => {
    switch (network) {
        case "ethereum":
        case "goerli":
            return "ETH";
        case "cypress":
        case "baobab":
            return "KLAY";
        case "polygon":
        case "mumbai":
            return "MATIC";
        case "bnb":
        case "tbnb":
            return "BNB";
    }
}

// copyClipboard Function
const copyClipboard = async (copyText) => {
    try {
        await navigator.clipboard.writeText(copyText);
        console.log('Text successfully copied to clipboard');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}

// Get displayed network name
const getDisplayNetwork = (network) => {
    switch (network) {
        case "ETHEREUM":
        case "ethereum":
            return "Ethereum";
        case "KLAYTN":
        case "cypress":
            return "Klaytn";
        case "POLYGON":
        case "polygon":
            return "Polygon";
        case "BINANCE":
        case "bnb":
            return "BNB Chain";
        case "GOERLI":
        case "goerli":
            return "Goerli";
        case "BAOBAB":
        case "baobab":
            return "Baobab";
        case "MUMBAI":
        case "mumbai":
            return "Mumbai";
        case "TBNB":
        case "tbnb":
            return "BNB Testnet";
    }
}

// Get Balance to Address
const getBalance = async (_network, _address) => {
    try {
        let url = `/getBalance?network=${_network}&account=${_address}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error("Response not OK", response);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if(data.result == "OK") {
            return Number(data.balance);
        } else {
            return data.error;
        }
        return data;
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
}

// Get Bridge Fee
const getCoinBridgeFee = async (typed) => {
    const chainId = await getChainId();
    const network = await getNetwork(chainId);
    const toNetwork = document.querySelector('.toNetwork').textContent;

    const url = `/getCoinBridgeFee/${network}/${toNetwork}`;

    const response = await fetch(url);

    if (!response.ok) {
        console.error("Response not OK", response);
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if(data.result == "OK") {
        document.querySelector('.nftDeployFee').innerHTML = `<h1>${data.bridgeFee} ${getSymbol(network)}</h1>`;
    } else {
        data.error;
    }
}

// Get Bridge Fee
const getBridgeFee = async (typed) => {
    const chainId = await getChainId();
    const network = await getNetwork(chainId);
    const toNetwork = document.querySelector('.toNetwork').textContent;
    const collection_id = document.querySelector('.selectedContract').textContent;

    const url = `/getBridgeFee/${network}/${toNetwork}/${collection_id}/${typed}`;

    const response = await fetch(url);

    if (!response.ok) {
        console.error("Response not OK", response);
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if(data.result == "OK") {
        document.querySelector('.nftDeployFee').innerHTML = `<h1>${data.bridgeFee} ${getSymbol(network)}</h1>`;
    } else {
        data.error;
    }
}

// Check Transaction Status
const checkTransactionStatus = async (txHash) => {
    try {
        console.log("txHash", txHash);
        const web3 = new Web3(window.ethereum);
        let receipt = null;
        let retryCount = 0; // Limit the number of retries

        while (receipt == null && retryCount < 20) { // Give it 20 attempts max
            try {
                receipt = await web3.eth.getTransactionReceipt(txHash);
            } catch (error) {
                console.log("Error fetching transaction receipt:", error.message);
                if (error.message.includes("Transaction not found")) {
                    retryCount++;
                } else {
                    throw error; // re-throw the error if it's not a "Transaction not found" error
                }
            }
            if (receipt == null) {
                console.log('Transaction not yet processed');
                await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds
            } else if (receipt.status == false) {
                console.log('Transaction failed');
            } else if (receipt.status == true) {
                console.log('Transaction Successful');
                return receipt.status;
            } else {
                console.log('Unable to determine transaction status');
            }
        }
    } catch (e) {
        console.log("error", e);
    }
}