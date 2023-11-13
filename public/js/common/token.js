let lastClickTime = 0;

const filterList = (query) => {
    // 모든 tokenCheck 항목에 대한 참조를 가져옵니다.
    let tokens = document.querySelectorAll('.tokenCheck');

    tokens.forEach(token => {
        // 데이터 속성 또는 텍스트 값을 기반으로 토큰을 필터링합니다.
        // 예제에서는 data-name 속성을 기반으로 토큰을 필터링합니다.
        let tokenSymbol = token.getAttribute('data-symbol');
        console.log("query", query);
        console.log("tokenName", tokenSymbol);
        if (tokenSymbol.toLowerCase().includes(query.toLowerCase())) {
            token.style.display = '';
        } else {
            token.style.display = 'none';
        }
    });
}

// Get Nft History
const historyTokenView = async () => {
    const bridgeActivityElement = document.querySelector('.bridge-activity');
    if (document.querySelector('.wallet-item').style.display != "flex") {
        bridgeActivityElement.innerHTML = "Wallet Connect Please";
        return;

    }
    const now = new Date().getTime();
    if (now - lastClickTime < 500) { // 500ms 이내에 중복 클릭이 발생한 경우
        return;
    }
    lastClickTime = now;

    bridgeActivityElement.innerHTML = "";

    const [account] = await getRequestAccounts();

    const getShortAddress =`${account.slice(0, 6)}...${account.slice(-6)}`;
    //fetch post method
    var response = await fetch(`/history/${account}/token`)

    var data = await response.json();

    console.log("data", data)

    for (const bridgeHistoryElement of data) {
        var date = daysDifference(bridgeHistoryElement.date);
        date--
        if(date < 1) {
            date = "Today";
        } else {
            date += " days ago";
        }
        const bridgeActivity = `
                <div class="bridge-active">
                    <div>
                        <span class="bridge-active-end">
                            ${date}
                        </span>

                    <div class="bridge-active-send">
                        <div>
                            <i class="token-icon"><img src="${getImageUrl(bridgeHistoryElement.fromNet)}"></i>
                            ${getDisplayNetwork(bridgeHistoryElement.fromNet)}
                        </div>
                        <div>
                            ${getShortAddress}
                        </div>
                    </div>
                    <i></i>
                    <div class="bridge-active-to">
                        <div>
                            <i class="token-icon"><img src="${getImageUrl(bridgeHistoryElement.toNet)}"></i>
                            ${getDisplayNetwork(bridgeHistoryElement.toNet)}
                        </div>
                        <div>
                            ${getShortAddress}
                        </div>
                    </div>
                </div>
                <div>
                    <p>
                        Confirmed on Transbridge Explorer
                    </p>
                    <span class="down-icon explorer-min-icon" onclick="explorerMinView(this)">
                            <i></i>

                            <div class="explorer-min">
                                <ul>
                                    <li onclick="window.open('${getExplorer(bridgeHistoryElement.fromNet, bridgeHistoryElement.fromHash)}')">
                                        <div class="token-icon"><img src="${getImageUrl(bridgeHistoryElement.fromNet)}"></div>
                                        <span>
                                            Chaeck on ${bridgeHistoryElement.fromNet} Explorer
                                        </span>
                                    </li>
                                    <li onclick="window.open('${getExplorer(bridgeHistoryElement.toNet, bridgeHistoryElement.toHash)}')">
                                        <div class="token-icon"><img src="${getImageUrl(bridgeHistoryElement.toNet)}"></div>
                                        <span>
                                            Chaeck on ${bridgeHistoryElement.toNet} Explorer
                                        </span>
                                    </li>
                                    <li onclick="window.open('/history/${account}')">
                                        <div class="token-icon"><img src="/img/transbridgelogo.png"></div>
                                        <span>
                                            Chaeck on Transbridge Explorer
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </span>
                    </div>
                </div>
                `
        bridgeActivityElement.insertAdjacentHTML("beforeend", bridgeActivity);
    }
}

// Html Init Function
const tokenHtmlInit = async () => {
    const chainId = await getChainId();
    const network = await getNetwork(chainId);

    document.querySelector('.selectedContract').innerHTML = "";
    document.querySelector('.selectedImg').innerHTML = `<img src="/img/transbridgelogo.png">`;
    document.querySelector('.selectedToImg').innerHTML = `<img src="/img/transbridgelogo.png">`;
    document.querySelector('.selectedName').innerHTML = "-";
    document.querySelector('.selectedToName').innerHTML = "-";
    document.querySelector('.selectedBalance').innerHTML = "0.00";
    document.querySelector('.bridgeAmount').value = '';
    document.querySelector('.bridgeToAmount').value = '';
    document.querySelector('.maxAmount').style.color = 'grey';
    document.querySelector('.maxAmount').disabled = true;

    const listItemAll = document.querySelectorAll('.bridge-list');
    const listBoxAll = document.querySelectorAll('.nft-box');
    const listSelectAll = document.querySelectorAll('.mainnet-select');
    listItemAll.forEach(function (item) {
        item.classList.remove('bridge-list-open');
    });
    listBoxAll.forEach(function (item) {
        item.style.height = '0';
    });
    listSelectAll.forEach(function (item) {
        item.classList.remove('mainnet-select-open');
    });

    document.querySelector('.baseFee').innerHTML = `<h1>-</h1>`;
    document.querySelector('.nftDeployFee').innerHTML = `<h1>-</h1>`;
    document.querySelector('.toNetworkFront').innerHTML = "Gorli";
    document.querySelector('.toNetworkImage').innerHTML = `<img src="/img/ethereum.png">`;
    const gasPriceCall = await fetch(`/getGasPrice/${network}`);
    const gasPriceValue = await gasPriceCall.json();
    document.querySelector('.baseFee').innerHTML = `${gasPriceValue.gasprice} ${getSymbol(network)}`;
    hideErrors();
}
const maxAmount = () => {
    const maxAmount = document.querySelector('.selectedBalance').textContent;
    document.querySelector('.bridgeAmount').value = maxAmount;
    document.querySelector('.bridgeToAmount').value = maxAmount;
    if(document.querySelector('.selectedContract').innerHTML != "") {
        getBridgeFee("token");
    } else {
        getCoinBridgeFee();
    }
}
const tokenListView =  async (account) => {
    tokenHtmlInit();
    const chainId = await getChainId();
    const getShortAddress =`${account.slice(0, 6)}...${account.slice(-6)}`;
    const network = await getNetwork(chainId);
    var url = `https://app.kthulu.io:3302/token/getTokenListAsync`

    //fetch post method
    var response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            network: network,
            account: account
        }),
    });
    var data = await response.json();
    const token_list = data.value;

    console.log("token_list", token_list)

    const balance = await getBalance(network, account);

    let mainBalanceStr = balance.toString();
    let mainDecimalIndex = mainBalanceStr.indexOf('.');

    if (mainDecimalIndex !== -1 && mainBalanceStr.length - mainDecimalIndex - 1 > 5) {
        mainBalanceStr = mainBalanceStr.slice(0, mainDecimalIndex + 6); // 소수점 포함 5자리까지만 슬라이스
    }

    document.querySelector(`.${network}-list`).innerHTML = "";

    console.log("token_list", token_list)

    if(token_list.length == 0 && balance == 0) {
        document.querySelector(`.${network}-list`).innerHTML = `<li class="${network}NoneToken" style="display: none;">
            <p>
                This Network does not have Token.
            </p>
        </li>
        `;
        document.querySelector(`.${network}NoneToken`).style.display = 'flex';
    } else {
        let sum = 0;
        for (const tokenListElement of token_list) {
            sum++;
            let balanceStr = tokenListElement.balance;
            let decimalIndex = balanceStr.indexOf('.');

            if (decimalIndex !== -1 && balanceStr.length - decimalIndex - 1 > 5) {
                balanceStr = balanceStr.slice(0, decimalIndex + 6); // 소수점 포함 5자리까지만 슬라이스
            }

            const nftOption = `
                <li class="tokenCheck" data-balance="${tokenListElement.balance}" data-contract="${tokenListElement.token_id}" data-decimals="${tokenListElement.decimals}" data-image="${tokenListElement.image}" data-name="${tokenListElement.name}" data-symbol="${tokenListElement.symbol}">
                    <div>
                        <i class="token-icon"><img
                        src="${tokenListElement.image}"
                        onerror="this.onerror=null; this.src='/img/notoken.png';"
                        /></i>
                        ${tokenListElement.symbol}
                    </div>
                    <div>
                        <div>${balanceStr}</div>
                        <p class="token-ckd-txt" style="cursor: pointer">Select</p>
                    </div>
                </li>
            `;
            const nftOption2 = `
                    <li class="tokenCheck" data-balance="${tokenListElement.balance}" data-contract="${tokenListElement.token_id}" data-decimals="${tokenListElement.decimals}" data-image="${tokenListElement.image}" data-name="${tokenListElement.name}" data-symbol="${tokenListElement.symbol}">
                        <label>
                            <input type="radio" name="mainnet-list" value="ethereum">
                            <div>
                                <div>
                                   <i class="token-icon"><img
                                    src="${tokenListElement.image}"
                                    onerror="this.onerror=null; this.src='/img/notoken.png';"
                                    /></i>
                                    ${tokenListElement.symbol}
                                </div>
                    
                            </div>
                        </label>
                    </li>`
            document.querySelector(`.${network}-list`).insertAdjacentHTML("beforeend", nftOption);
            document.querySelector(`.token-popup-list`).insertAdjacentHTML("beforeend", nftOption2);

        }

        const nativeCoin = `
                <li class="tokenCheck" data-balance="${balance}" data-contract="" data-decimals="18" data-image="${getImageUrl(network)}" data-symbol="${getSymbol(network)}">
                    <div>
                        <i class="token-icon"><img
                        src="${getImageUrl(network)}"
                        /></i>
                        ${getSymbol(network)}
                    </div>
                    <div>
                        <div>${mainBalanceStr}</div>
                        <p class="token-ckd-txt" style="cursor: pointer">Select</p>
                    </div>
                </li>
            `
        const nativeCoinSelect = `
                <li class="tokenCheck" data-balance="${balance}" data-contract="" data-decimals="18" data-image="${getImageUrl(network)}" data-symbol="${getSymbol(network)}">
                    <label>
                        <input type="radio" name="mainnet-list" value="ethereum">
                        <div>
                            <div>
                               <i class="token-icon"><img
                                src="${getImageUrl(network)}"
                                /></i>
                                ${getSymbol(network)}
                            </div>
                        </div>
                    </label>
                </li>`
        document.querySelector(`.${network}-list`).insertAdjacentHTML("afterbegin", nativeCoin);
        document.querySelector(`.token-popup-list`).insertAdjacentHTML("afterbegin", nativeCoinSelect);
    }
    document.querySelector(`.${network}Loader`).style.display = 'none';
    document.querySelector(`.${network}Down`).style.display = 'flex';
    document.querySelector(`.${network}-connect`).querySelector('.token-box').style.height = 'auto';
    document.querySelector(`.${network}-connect`).closest('.bridge-list').classList.add('bridge-list-open');
}

document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('.bridgeAmount').addEventListener('input', function(event) {
        const bridgeToAmountInput = document.querySelector('.bridgeToAmount');
        bridgeToAmountInput.value = event.target.value;
    });

    // searchToken 입력 필드에 대한 참조를 가져옵니다.
    let searchInput = document.querySelector('.searchToken');

    // 'input' 이벤트 리스너를 추가합니다.
    searchInput.addEventListener('input', function() {
        filterList(searchInput.value);
    });

    document.body.addEventListener('click', function (event) {

        // Token Select
        if (event.target.closest('.tokenCheck')) {
            const tokenCheck = event.target.closest('.tokenCheck');
            const maxAmount = document.querySelector('.maxAmount');
            maxAmount.style.color = 'black';
            maxAmount.disabled = false;

            document.querySelector('.bridge-nft-bt-disable').style.display = 'none';
            document.querySelector('.bridge-nft-bt').style.display = 'block';

            const allElements = document.querySelectorAll('.token-ckd-txt');
            allElements.forEach(element => {
                element.style.color = 'grey';
            });

            const selectedToken = event.target.closest('.tokenCheck');
            if (selectedToken) {
                // 선택한 토큰의 data-name 값을 가져옵니다.
                const tokenName = selectedToken.getAttribute('data-symbol');

                console.log(tokenName);

                // 동일한 data-name 값을 가진 모든 .tokenCheck를 찾아 해당하는 .token-ckd-txt의 색상을 변경합니다.
                const matchingTokens = document.querySelectorAll(`.tokenCheck[data-symbol="${tokenName}"]`);
                matchingTokens.forEach(token => {
                    console.log(token);
                    const tokenTextElement = token.querySelector('.token-ckd-txt');
                    if (tokenTextElement) {
                        tokenTextElement.style.color = '#6FCF97';
                    }
                });
            }

            document.querySelector('.selectedImg').innerHTML = `<img src="${tokenCheck.dataset.image}" onerror="this.onerror=null; this.src='/img/notoken.png';"/>`
            let symbol = tokenCheck.dataset.symbol;
            if (symbol.length > 6) {
                symbol = symbol.substring(0, 6) + "...";
            }
            document.querySelector('.selectedName').innerHTML = symbol;

            switch (tokenCheck.dataset.symbol) {
                case "wETH":
                    document.querySelector('.selectedToName').innerHTML = `ETH`;
                    document.querySelector('.selectedToImg').innerHTML = `<img src="${getImageUrl("ethereum")}"/>`
                    break;
                case "wKLAY":
                    document.querySelector('.selectedToName').innerHTML = `KLAY`;
                    document.querySelector('.selectedToImg').innerHTML = `<img src="${getImageUrl("cypress")}"/>`
                    break;
                case "wMATIC":
                    document.querySelector('.selectedToName').innerHTML = `MATIC`;
                    document.querySelector('.selectedToImg').innerHTML = `<img src="${getImageUrl("polygon")}"/>`
                    break;
                case "wBNB":
                    document.querySelector('.selectedToName').innerHTML = `BNB`;
                    document.querySelector('.selectedToImg').innerHTML = `<img src="${getImageUrl("bnb")}"/>`
                    break;
                default:
                    let symbol = `w${tokenCheck.dataset.symbol}`;
                    if (symbol.length > 6) {
                        symbol = `${symbol.substring(0, 6)}...`;
                    }
                    document.querySelector('.selectedToName').innerHTML = symbol;
                    document.querySelector('.selectedToImg').innerHTML = `<img src="${tokenCheck.dataset.image}" onerror="this.onerror=null; this.src='/img/notoken.png';"/>`

            }
            document.querySelector('.selectedBalance').innerHTML = tokenCheck.dataset.balance;
            document.querySelector('.selectedContract').innerHTML = tokenCheck.dataset.contract;

            if(document.querySelector('.selectedContract').innerHTML != "") {
                getBridgeFee("token");
            } else {
                getCoinBridgeFee();
            }
        }

        if (event.target.closest('.toNetworkChange')) {
            hideErrors();
            const nftCheck = event.target.closest('.toNetworkChange');
            document.querySelector('.toNetwork').innerHTML = nftCheck.dataset.network;
            document.querySelector('.toNetworkFront').innerHTML = getDisplayNetwork(nftCheck.dataset.network);
            document.querySelector('.toNetworkImage').innerHTML = `<img src=${nftCheck.dataset.image}>`;

            if (document.querySelector('.selectedBalance').textContent > 0) {
                if(document.querySelector('.selectedContract').innerHTML != "") {
                    getBridgeFee("token");
                } else {
                    getCoinBridgeFee();
                }

            }
        }
    });

    const bridgeTokenAction = document.querySelector('.bridgeTokenAction')
    if(bridgeTokenAction) {
        bridgeTokenAction.addEventListener('click', async function () {
            const nftBridgeLoading = document.querySelector('.nftBridgeLoading');
            const nftBridgeChk = document.querySelector('.nftBridgeChk');
            const toNetwork = document.querySelector('.toNetwork').textContent;
            const chainId = await getChainId();
            let network = await getNetwork(chainId);

            if(network == toNetwork) {
                document.querySelector('.layer-activity').classList.remove('layer-view');
                document.querySelector('.err-txt').textContent = "동일한 네트워크로는 브릿지가 불가능합니다.";
                document.querySelector('.err-txt').style.display = 'flex';
                return false;
            }
            document.querySelector('.approveChk').style.display = 'none'
            document.querySelector('.err-txt').style.display = 'none';
            document.querySelector('.approveLoading').style.display = 'block';

            const [account] = await getRequestAccounts();
            const fromAddress = account;

            const token_address = document.querySelector('.selectedContract').textContent;
            const amount = document.querySelector('.bridgeAmount').value;

            try {
                if (token_address) {
                    //fetch post method
                    var response = await fetch("/tokenBridgeAppoveAsync", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            network: network,
                            account: fromAddress,
                            to_network: toNetwork,
                            token_address: token_address,
                            amount: amount
                        }),
                    });

                    var data = await response.json();
                    console.log(data);

                    var dataResult = data.result;
                    var txDetails = data.transaction;

                    if (dataResult == "FAIL") {
                        document.querySelector('.layer-activity').classList.remove('layer-view');
                        document.querySelector('.err-txt').textContent = "잔액이 부족합니다.";
                        document.querySelector('.err-txt').style.display = 'flex';
                        return false;
                    }

                    if (dataResult == "OK" && txDetails != "0") {
                        var trnasaction_hash = await window.ethereum.request({
                            "method": "eth_sendTransaction",
                            "params": [
                                txDetails
                            ]
                        });
                        const status = await checkTransactionStatus(trnasaction_hash);
                        if (status) {
                            nftBridgeChk.style.display = 'none';
                            nftBridgeLoading.style.display = 'block';
                            document.querySelector('.approveLoading').style.display = 'none';
                            document.querySelector('.approveChk').style.display = 'block';
                            console.log(network, fromAddress, toNetwork, token_address, amount)
                            //fetch post method
                            var response = await fetch("/tokenBridgeAsync", {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    network: network,
                                    account: fromAddress,
                                    to_network: toNetwork,
                                    token_address: token_address,
                                    amount: amount
                                }),
                            });

                            var data = await response.json();
                            console.log(data);

                            var txDetails = data.transaction;

                            console.log(txDetails)

                            var trnasaction_hash = await window.ethereum.request({
                                "method": "eth_sendTransaction",
                                "params": [
                                    txDetails
                                ]
                            });
                            const status = await checkTransactionStatus(trnasaction_hash);
                            if (status) {
                                tokenHtmlInit();
                                nftBridgeLoading.style.display = 'none';
                                nftBridgeChk.style.opacity = "";
                                nftBridgeChk.style.display = 'block';
                                document.querySelector('#statusFromNetwork').innerHTML = `<i class="token-icon"><img src="${getImageUrl(network)}"></i> ${getDisplayNetwork(network)}`;
                                document.querySelector('#statusToNetwork').innerHTML = `<i class="token-icon"><img src="${getImageUrl(toNetwork)}"></i> ${getDisplayNetwork(toNetwork)}`;
                                document.querySelector('#statusFromAccount').innerHTML = `${fromAddress.slice(0, 6)}...`;
                                document.querySelector('#statusToAccount').innerHTML = `${fromAddress.slice(0, 6)}...`;
                                document.querySelector('.layer-activity').classList.remove('layer-view');
                                document.querySelector('.bridgeStatusChk').style.display = 'block';
                                setTimeout(() => {
                                    document.querySelector('.bridgeStatusChk').style.display = 'none';
                                }, 180000);
                            }
                        }
                    }
                    if (dataResult == "OK" && txDetails == "0") {
                        nftBridgeChk.style.display = 'none';
                        nftBridgeLoading.style.display = 'block';
                        document.querySelector('.approveLoading').style.display = 'none';
                        document.querySelector('.approveChk').style.display = 'block';

                        console.log(network, fromAddress, toNetwork, token_address, amount)

                        //fetch post method
                        var response = await fetch("/tokenBridgeAsync", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                network: network,
                                account: fromAddress,
                                to_network: toNetwork,
                                token_address: token_address,
                                amount: amount
                            }),
                        });

                        var data = await response.json();
                        console.log(data);

                        var txDetails = data.transaction;

                        console.log(txDetails)

                        var trnasaction_hash = await window.ethereum.request({
                            "method": "eth_sendTransaction",
                            "params": [
                                txDetails
                            ]
                        });
                        const status = await checkTransactionStatus(trnasaction_hash);
                        if (status) {
                            tokenHtmlInit();
                            nftBridgeLoading.style.display = 'none';
                            nftBridgeChk.style.opacity = "";
                            nftBridgeChk.style.display = 'block';
                            document.querySelector('#statusFromNetwork').innerHTML = `<i class="token-icon"><img src="${getImageUrl(network)}"></i> ${getDisplayNetwork(network)}`;
                            document.querySelector('#statusToNetwork').innerHTML = `<i class="token-icon"><img src="${getImageUrl(toNetwork)}"></i> ${getDisplayNetwork(toNetwork)}`;
                            document.querySelector('#statusFromAccount').innerHTML = `${fromAddress.slice(0, 6)}...`;
                            document.querySelector('#statusToAccount').innerHTML = `${fromAddress.slice(0, 6)}...`;
                            document.querySelector('.layer-activity').classList.remove('layer-view');
                            document.querySelector('.bridgeStatusChk').style.display = 'block';
                            setTimeout(() => {
                                document.querySelector('.bridgeStatusChk').style.display = 'none';
                            }, 180000);
                        }
                    }
                } else {
                    nftBridgeChk.style.display = 'none';
                    nftBridgeLoading.style.display = 'block';
                    document.querySelector('.approveLoading').style.display = 'none';
                    document.querySelector('.approveChk').style.display = 'block';

                    console.log(network, fromAddress, toNetwork, amount)

                    //fetch post method
                    var response = await fetch("/tokenBridgeAsync", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            network: network,
                            account: fromAddress,
                            to_network: toNetwork,
                            amount: amount
                        }),
                    });

                    var data = await response.json();
                    console.log(data);

                    var txDetails = data.transaction;

                    console.log(txDetails)

                    var trnasaction_hash = await window.ethereum.request({
                        "method": "eth_sendTransaction",
                        "params": [
                            txDetails
                        ]
                    });
                    const status = await checkTransactionStatus(trnasaction_hash);
                    if (status) {
                        tokenHtmlInit();
                        nftBridgeLoading.style.display = 'none';
                        nftBridgeChk.style.opacity = "";
                        nftBridgeChk.style.display = 'block';
                        document.querySelector('#statusFromNetwork').innerHTML = `<i class="token-icon"><img src="${getImageUrl(network)}"></i> ${getDisplayNetwork(network)}`;
                        document.querySelector('#statusToNetwork').innerHTML = `<i class="token-icon"><img src="${getImageUrl(toNetwork)}"></i> ${getDisplayNetwork(toNetwork)}`;
                        document.querySelector('#statusFromAccount').innerHTML = `${fromAddress.slice(0, 6)}...`;
                        document.querySelector('#statusToAccount').innerHTML = `${fromAddress.slice(0, 6)}...`;
                        document.querySelector('.layer-activity').classList.remove('layer-view');
                        document.querySelector('.bridgeStatusChk').style.display = 'block';
                        setTimeout(() => {
                            document.querySelector('.bridgeStatusChk').style.display = 'none';
                        }, 180000);
                    }
                }

            } catch (e) {
                document.querySelector('.layer-activity').classList.remove('layer-view');
                document.querySelector('.err-txt').textContent = "잔액이 부족합니다.";
                document.querySelector('.err-txt').style.display = 'flex';
                console.log("error", e)
            }

        })
    }
});
