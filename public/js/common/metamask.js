
// Mapping Chain ID to Network Name
const CHAIN_MAPPING = {
    ethereum: "0x1",
    cypress: "0x2019",
    polygon: "0x89",
    bnb: "0x38",
    goerli : "0x5",
    baobab: "0x3e9",
    mumbai : "0x13881"
};

// Get Chain Id
const getChainId = async () => {
    return window.ethereum.chainId;
}

// Get Changed Network Name
const toNetworkChange = async (evnet) => {
    event.stopPropagation();
    // radio checked value
    const toNetwork = document.querySelector('input[name="mainnet-list"]:checked');
    console.log(toNetwork);
}

// Html Init Function
const htmlInit = () => {
    document.querySelector('.noNftSelect').style.display = 'flex';
    document.querySelector('.select-nft').style.display = 'none';
    const listItemAll = document.querySelectorAll('.bridge-list');
    const listBoxAll = document.querySelectorAll('.nft-box');
    listItemAll.forEach(function (item) {
        item.classList.remove('bridge-list-open');
    });
    listBoxAll.forEach(function (item) {
        item.style.height = '0';
    });

    document.querySelector('.baseFee').innerHTML = `<h1>-</h1>`;
    document.querySelector('.nftDeployFee').innerHTML = `<h1>-</h1>`;
    document.querySelector('.toNetworkFront').innerHTML = "Ethereum";
    document.querySelector('.toNetworkImage').innerHTML = `<img src="/img/ethereum.png">`;

    connectMetamask();
}

// Mapping Network Name to ChainId
const getNetwork = async (_chainId) => {
    let network = "";
    switch (_chainId) {
        case "0x1":
            network = "ethereum"
            break;
        case "0x2019":
            network = "cypress"
            break;
        case "0x89":
            network = "polygon"
            break;
        case "0x38":
            network = "bnb"
            break;
        case "0x5":
            network = "goerli"
            break;
        case "0x3e9":
            network = "baobab"
            break;
        case "0x13881":
            network = "mumbai"
            break;
    }
    return network;
}

// Metamask Add Network
const addNetwork = async (_chainId) => {
    let chainName = "";
    let rpcUrls = [];
    let nativeCurrency = {};
    let blockExplorerUrls = [];

    switch (_chainId) {
        case "0x1":
            chainName = "Ethereum Mainnet";
            rpcUrls = ["https://ethereum.publicnode.com"];
            nativeCurrency = {
                symbol: 'ETH',
                decimals: 18
            },
                blockExplorerUrls = ["https://etherscan.io/"]
            break
        case "0x2019":
            chainName = "Klaytn Cypress";
            rpcUrls = ["https://public-en-cypress.klaytn.net/"];
            nativeCurrency = {
                symbol: 'KLAY',
                decimals: 18
            },
                blockExplorerUrls = ["https://scope.klaytn.com/"]
            break
        case "0x89":
            chainName = "Polygon Mainnet";
            rpcUrls = ["https://polygon-rpc.com"];
            nativeCurrency = {
                symbol: 'MATIC',
                decimals: 18
            },
                blockExplorerUrls = ["https://polygonscan.com/"]
            break
        case "0x38":
            chainName = "BNB Chain";
            rpcUrls = ["https://bsc-dataseed.binance.org/"];
            nativeCurrency = {
                symbol: 'BNB',
                decimals: 18
            },
                blockExplorerUrls = ["https://bscscan.com/"]
            break
    }

    const network = {
        chainId: _chainId,
        chainName: chainName,
        rpcUrls: rpcUrls,
        nativeCurrency: nativeCurrency,
        blockExplorerUrls: blockExplorerUrls
    };

    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
        })
    } catch (e) {
        console.error("Failed to add Ethereum chain:", e.message);
    }

}

// Get Accounts to Metamask
const getRequestAccounts = async () => {
    try {
        return await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
    } catch (e) {
        console.error("Failed to request accounts:", e.message);
    }
};

// Connect Metamask
const connectMetamask = async () => {
    const elements = document.querySelectorAll('.nft-ckd-txt');
    elements.forEach(element => {
        element.style.color = '#828282';
    });
    document.querySelector('.connectMetamask').style.display = 'none';
    const walletConnectLoaderView = document.querySelector('.connect-wallet .loader');
    walletConnectLoaderView.style.display = 'inline-block'
    const [account] = await getRequestAccounts();
    const menuCheck = window.location.pathname;
    const chainId = await getChainId();

    const network = await getNetwork(chainId);

    document.querySelector(`.${network}Down`).style.display = 'none';
    document.querySelector(`.${network}Loader`).style.display = 'flex';

    const balance = await getBalance(network, account);
    const getShortAddress =`${account.slice(0, 6)}...${account.slice(-6)}`;

    document.querySelector('.connected_balance').innerHTML = `${balance.toFixed(3)} ${getSymbol(network)}`;
    document.querySelector('.connected_account').innerHTML = getShortAddress;

    document.querySelector('.layer-connect').classList.remove('layer-view');
    document.querySelector('.connect-wallet-bt').style.display = 'none';
    document.querySelector('.wallet-item').style.display = 'flex';
    document.querySelector(`input[name="mainnet-change"][value="${chainId}"]`).checked = true;

    document.querySelector(`#${network}-connect-text`).style.color = "#6FCF97"

    document.querySelectorAll('.bridge-list').forEach(div => {
        div.classList.remove('bridge-list-connect');
    });


    document.querySelector(`.${network}-connect`).classList.add('bridge-list-connect')

    document.querySelector('.fromNetwork').innerHTML = getDisplayNetwork(network);
    document.querySelector('.fromNetworkImage').innerHTML = `<img src="${getImageUrl(network)}">`;

    document.querySelector('#popupAccount').innerHTML = getShortAddress;
    document.querySelector('#popupBalance').innerHTML = `${balance.toFixed(3)} ${getSymbol(network)}`;

    const gasPriceCall = await fetch(`/getGasPrice/${network}`);
    const gasPriceValue = await gasPriceCall.json();

    document.querySelector('.baseFee').innerHTML = `${gasPriceValue.gasprice} ${getSymbol(network)}`;

    if (menuCheck === '/') {
        document.querySelector('.token-menu').classList.add('header-menu-ckd');
        tokenListView(account);
        historyTokenView()
    } else if (menuCheck === '/nft') {
        document.querySelector('.select-nft').style.display = 'none';
        nftListView(account);
        historyView()
    }
}

// Change Metamask Account
const changeAccount = async () => {

    document.querySelector('.baseFee').innerHTML = "-";
    document.querySelector('.nftDeployFee').innerHTML = `<h1>-</h1>`;
    const listItemAll = document.querySelectorAll('.bridge-list');
    const listBoxAll = document.querySelectorAll('.nft-box');
    listItemAll.forEach(function (item) {
        item.classList.remove('bridge-list-open');
    });
    listBoxAll.forEach(function (item) {
        item.style.height = '0';
    });
    await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{
            eth_accounts: {}
        }]
    }).then((result) => {
        document.querySelector('.layer-wallet').classList.remove('layer-view');
        setTimeout(() => {
            const menuCheck = window.location.pathname;
            if (menuCheck === '/b2c/token') {
                tokenHtmlInit()
            } else {
                htmlInit()
            }
            connectMetamask();
        }, 500);
    })
}

// Disconnect Metamask
const disconnectMetamask = async () => {
    location.reload();
}

document.addEventListener('DOMContentLoaded', async () => {

    // Mainnet Change
    const mainnets = document.querySelectorAll('input[name="mainnet-change"]');
    mainnets.forEach(mainnet => {
        mainnet.addEventListener('click', async function () {
            const listItemAll = document.querySelectorAll('.bridge-list');
            const listBoxAll = document.querySelectorAll('.nft-box');
            const listTokenBoxAll = document.querySelectorAll('.token-box');
            document.querySelector('.nftDeployFee').innerHTML = `<h1>-</h1>`;
            document.querySelector('.baseFee').innerHTML = "-";
            listItemAll.forEach(function (item) {
                item.classList.remove('bridge-list-open');
            });
            listBoxAll.forEach(function (item) {
                item.style.height = '0';
            });
            listTokenBoxAll.forEach(function (item) {
                item.style.height = '0';
            });
            const select_mainnet = mainnet.value;
            const chainId = await getChainId();
            console.log(select_mainnet, chainId);

            mainnets.forEach(mn => {
                const connectText = mn.nextElementSibling;
                if (connectText) {
                    connectText.style.color = 'grey';  // 초기 색상 (또는 원하는 기본 색상)으로 재설정
                }
            });

            const selectedConnectText = this.nextElementSibling;
            if (selectedConnectText) {
                selectedConnectText.style.color = '#6FCF97';
            }

            if (select_mainnet) {
                await addNetwork(select_mainnet)
                setTimeout(() => {
                    connectMetamask();
                }, 500);

            }


        });
    });

    // Metamask Installed Check
    const isMetaMaskInstalled = () => {
        return Boolean(window.ethereum && window.ethereum.isMetaMask);
    };
    if (isMetaMaskInstalled()) {
        document.querySelector('.connect-chrome').style.display = 'none';
        document.querySelector('.connect-wallet').style.display = 'flex';
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            connectMetamask();
        }

    }

});
