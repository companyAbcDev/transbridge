let lastClickTime = 0;

// Get Nft History
const historyView = async () => {
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
    var response = await fetch(`/history/${account}/nft`)

    var data = await response.json();

    console.log(data);

    for (const bridgeHistoryElement of data) {
        var date = daysDifference(bridgeHistoryElement.date);
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
                                    <li onclick="window.open('/nft/history/${account}')">
                                        <div class="token-icon"><img src="/img/transbridgelogo.svg"></div>
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


// Nft List View
const nftListView = async (account) => {
    const chainId = await getChainId();
    const getShortAddress =`${account.slice(0, 6)}...${account.slice(-6)}`;
    const network = await getNetwork(chainId);
    const nftEmptyList = document.querySelectorAll(`.nftEmptyList`)
    nftEmptyList.forEach(element => {
        element.style.display = 'none';
    });
    document.querySelector('.noNftSelect').style.display = 'flex';
    document.querySelector('.noNftSelect').innerHTML = "Please Select NFT";

    var url = `https://app.kthulu.io:3302/nft/getNftListAsync`

    //fetch post method
    var response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            network: [network],
            account: [account]
        }),
    });

    let addressElements = document.querySelector('.bridgeToAddress');
    addressElements.innerHTML = account;

    var data = await response.json();
    const nft_list = data.value;


    if(document.querySelector(`.${network}-list`)) {
        document.querySelector(`.${network}-list`).innerHTML = "";
        let sum = 0;
        for (const nftListElement of nft_list) {
            sum++;
            const nftOption = `
                <li class="nftCheck" data-network="${nftListElement.network}" data-type="${nftListElement.nft_type}" data-owner="${nftListElement.owner}" data-name="${nftListElement.name}" data-collect_id="${nftListElement.collection_id}" data-token_id="${nftListElement.token_id}" data-image="${nftListElement.image}" data-balance="${nftListElement.token_balance}">
                <label>
                    <input type="radio" name="nftCheck">
                    <div>
                        <img
                    src="${nftListElement.image}"
                    onerror="this.onerror=null; this.src='/img/nonft.png';"
                    />
                    </div>
                </label>
            </li>
            `;
            document.querySelector(`.${network}-list`).insertAdjacentHTML("beforeend", nftOption);
        }
        const nftTotal = document.querySelectorAll('.nftTotal')
        nftTotal.forEach(element => {
            element.innerHTML = sum;
        })

        if(sum < 1) {
            nftEmptyList.forEach(element => {
                element.style.display = 'block';
            });
        }

        document.querySelector(`.${network}Loader`).style.display = 'none';
        document.querySelector(`.${network}Down`).style.display = 'flex';

        //fetch post method
        var response = await fetch(`/history/${account}/nft`)

        var data = await response.json();

        console.log(data);

        for (const bridgeHistoryElement of data) {
            var date = daysDifference(bridgeHistoryElement.date);
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
                    ${bridgeHistoryElement.fromNet}
                </div>
                <div>
                    ${getShortAddress}
                </div>
            </div>
            <i></i>
            <div class="bridge-active-to">
                <div>
                    <i class="token-icon"><img src="${getImageUrl(bridgeHistoryElement.toNet)}"></i>
                    ${bridgeHistoryElement.toNet}
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
                                <div class="token-icon"></div>
                                <span>
                                    Chaeck on ${bridgeHistoryElement.fromNet} Explorer
                                </span>
                            </li>
                            <li onclick="window.open('${getExplorer(bridgeHistoryElement.toNet, bridgeHistoryElement.toHash)}')">
                                <div class="token-icon"></div>
                                <span>
                                    Chaeck on ${bridgeHistoryElement.toNet} Explorer
                                </span>
                            </li>
                            <li onclick="window.open('/b2c/nft/${account}')">
                                <div class="token-icon"></div>
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
            document.querySelector('.bridge-activity').insertAdjacentHTML("beforeend", bridgeActivity);
        }

        document.querySelector(`.${network}-connect`).querySelector('.nft-box').style.height = 'auto';
        document.querySelector(`.${network}-connect`).closest('.bridge-list').classList.add('bridge-list-open');
    }
}



document.addEventListener('DOMContentLoaded', () => {

    document.body.addEventListener('click', function (event) {

        // NFT Select
        if (event.target.closest('.nftCheck')) {
            document.querySelector('.noNftSelect').style.display = 'none';
            document.querySelector('.select-nft').style.display = 'flex';

            const elements = document.querySelectorAll('.nft-ckd-txt');
            const nftCheck = event.target.closest('.nftCheck');
            const nft_type = nftCheck.dataset.type;

            elements.forEach(element => {
                element.style.color = '#6FCF97';
            });

            document.querySelector('.bridge-nft-bt-disable').style.display = 'none';
            document.querySelector('.bridge-nft-bt').style.display = 'block';
            document.querySelector('.selectedImg').innerHTML = `<img src="${nftCheck.dataset.image}" onerror="this.onerror=null; this.src='/img/nonft.png';"/>`
            document.querySelector('.selectedName').innerHTML = nftCheck.dataset.name;
            document.querySelector('.selectedContract').innerHTML = nftCheck.dataset.collect_id;
            document.querySelector('.selectedTokenId').innerHTML = nftCheck.dataset.token_id;
            document.querySelector('.selectedBalance').innerHTML = nftCheck.dataset.balance;

            if (nft_type == "ERC721" || nft_type == "UNKNOWN") {
                document.querySelector('.ercView').style.display = 'none';
                document.querySelector('.selectedAmount').value = "1";
                document.querySelector('.selectedAmount').disabled = true;
            } else {
                document.querySelector('.ercView').style.display = 'flex';
                document.querySelector('.selectedAmount').disabled = false;
            }

            getBridgeFee("nft");
        // To Network Change
        } else if (event.target.closest('.toNetworkChange')) {
            const nftCheck = event.target.closest('.toNetworkChange');
            document.querySelector('.toNetwork').innerHTML = nftCheck.dataset.network;
            document.querySelector('.toNetworkFront').innerHTML = getDisplayNetwork(nftCheck.dataset.network);
            document.querySelector('.toNetworkImage').innerHTML = `<img src=${nftCheck.dataset.image}>`;

            if (document.querySelector('.select-nft').style.display == "flex") {
                getBridgeFee("nft");

            }
        }
    });

    // Bridge NFT Action
    const bridgeNftAction = document.querySelector('.bridgeNftAction')
    if(bridgeNftAction) {
        bridgeNftAction.addEventListener('click', async function () {
            const nftBridgeLoading = document.querySelector('.nftBridgeLoading');
            const nftBridgeChk = document.querySelector('.nftBridgeChk');
            const chainId = await getChainId();
            let network = await getNetwork(chainId);
            const fromAddress = document.querySelector('.bridgeToAddress').textContent;
            const toNetwork = document.querySelector('.toNetwork').textContent;
            const collection_id = document.querySelector('.selectedContract').textContent;
            const token_id = document.querySelector('.selectedTokenId').textContent;
            const inputElement = document.querySelector('.selectedAmount');

            if(network == toNetwork) {
                document.querySelector('.layer-activity').classList.remove('layer-view');
                document.querySelector('.err-txt').textContent = "동일한 네트워크로는 브릿지가 불가능합니다.";
                document.querySelector('.err-txt').style.display = 'flex';
                return false;
            }
            document.querySelector('.approveChk').style.display = 'none'
            document.querySelector('.err-txt').style.display = 'none';
            document.querySelector('.approveLoading').style.display = 'block';

            let amount;

            if (inputElement && inputElement.disabled) {
                amount = "";
            } else {
                amount = inputElement.value; // 이 부분은 amount에 어떤 값을 할당하고 싶은지에 따라 변경될 수 있습니다.
            }

            try {
                //fetch post method
                var response = await fetch("/nft/nftBridgeAppoveAsync", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        network: network,
                        account: fromAddress,
                        to_network: toNetwork,
                        collection_id: collection_id
                    }),
                });

                var data = await response.json();
                console.log(data);

                var dataResult = data.result;
                var txDetails = data.transaction;

                if(dataResult == "FAIL") {
                    document.querySelector('.layer-activity').classList.remove('layer-view');
                    document.querySelector('.err-txt').textContent = "잔액이 부족합니다.";
                    document.querySelector('.err-txt').style.display = 'flex';
                    return false;
                }

                if(dataResult == "OK" && txDetails != "0") {
                    var trnasaction_hash = await window.ethereum.request({
                        "method": "eth_sendTransaction",
                        "params": [
                            txDetails
                        ]
                    });
                    const status = await checkTransactionStatus(trnasaction_hash);
                    if(status) {
                        nftBridgeChk.style.display = 'none';
                        nftBridgeLoading.style.display = 'block';
                        document.querySelector('.approveLoading').style.display = 'none';
                        document.querySelector('.approveChk').style.display = 'block';
                        console.log(network, fromAddress, toNetwork, collection_id, token_id, amount)
                        //fetch post method
                        var response = await fetch("/nft/nftBridgeAsync", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                network: network,
                                account: fromAddress,
                                to_network: toNetwork,
                                collection_id: collection_id,
                                token_id: token_id,
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
                        if(status) {
                            nftBridgeLoading.style.display = 'none';
                            nftBridgeChk.style.opacity = "";
                            nftBridgeChk.style.display = 'block';
                            htmlInit();
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
                if(dataResult == "OK"&& txDetails == "0") {
                    nftBridgeChk.style.display = 'none';
                    nftBridgeLoading.style.display = 'block';
                    document.querySelector('.approveLoading').style.display = 'none';
                    document.querySelector('.approveChk').style.display = 'block';

                    console.log(network, fromAddress, toNetwork, collection_id, token_id, amount)

                    //fetch post method
                    var response = await fetch("/nft/nftBridgeAsync", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            network: network,
                            account: fromAddress,
                            to_network: toNetwork,
                            collection_id: collection_id,
                            token_id: token_id,
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
                    if(status) {
                        nftBridgeLoading.style.display = 'none';
                        nftBridgeChk.style.opacity = "";
                        nftBridgeChk.style.display = 'block';
                        htmlInit();
                        document.querySelector('#statusFromNetwork').innerHTML = `<i class="token-icon"><img src="${getImageUrl(network)}"></i> ${network}`;
                        document.querySelector('#statusToNetwork').innerHTML = `<i class="token-icon"><img src="${getImageUrl(toNetwork)}"></i> ${toNetwork}`;
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

// Initiate the token object
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', function (event) {
        if (event.target.closest('.toNetworkChange')) {
            hideErrors();
            const nftCheck = event.target.closest('.toNetworkChange');
            document.querySelector('.toNetwork').innerHTML = nftCheck.dataset.network;
            document.querySelector('.toNetworkFront').innerHTML = getDisplayNetwork(nftCheck.dataset.network);
            document.querySelector('.toNetworkImage').innerHTML = `<img src=${nftCheck.dataset.image}>`;

            if (document.querySelector('.select-nft').style.display == "flex") {
                getBridgeFee("nft");

            }
        }

    });
});