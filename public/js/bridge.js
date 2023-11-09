// Bridge 클릭 펑션

function connectWallet() {
    const connectLayer = document.querySelector('.layer-connect');

    connectLayer.classList.add('layer-view')
}

// function connectLayerInner(val) {
//     const connectLayerInner = document.querySelector('.connect-inner');

//     const kthuluContent = `
//     <div class="connect-kthulu">
//     <h1>
//         Kthulu 지갑을 연결해보세요.
//     </h1>

//     <p>
//         크툴루는 NFT의 활용성을 극대화시키는 NFT 전용 지갑입니다.
//     </p>

//     <img src="../transbridgeImg/kthulu-connect-transbridgelogo.png" alt="">

//     <p> 
//         NFT에 특화된 다양한 편의 기능을 제공하고, 블록체인 세상 속 <br /> 
//         NFT를 오프라인 세상과 연결하여 새로운 NFT 경험을 만들어 나갈 수 <br />
//         있습니다. 

//         <br />
//         <br />

//         지금 지갑을 생성하고 이벤트에 참여해보세요!
//     </p>

//     <div>
//         <button>
//             생성하기
//         </button>
//         <a href="#">Learn More</a>
//     </div>

// </div>
//     `
//     const otherContent = `
//     <div class="connect-other">
//     <h1>
//         Scan with Coinbase Wallet
//     </h1>
//     <div class="other-qr-box">
//         <img src="../transbridgeImg/other-qr.png" alt="">
//     </div>

//     <div class="connect-other-bot">
//         <span>Don’t have Coinbase Wallet?</span>

//         <button>GET</button>
//     </div>

// </div>
//     `
//     const chromeContent = `
//     <div class="connect-chrome">
//     <h1>Get KaiKas Wallet</h1>

//     <div>
//         <div class="chrome-item">
//             <i>
//                 <img src="../transbridgeImg/chrome.png" alt="">
//             </i>
//             <div>
//                 <h2>Rabby Wallet for Chrome</h2>
//                 <p>
//                     Access your wallet right from <br />
//                     your favorite web browser.
//                 </p>
//                 <button>
//                     Add to Chrome
//                 </button>
//             </div>
//         </div>
//     </div>
// </div>
//     `
//     const walletContent = `
//     <div class="connect-wallet">
//     <h1>Get Metamask Wallet</h1>

//     <div>
//         <div class="opening-wallet">
//             <i>
//                 <img src="../transbridgeImg/metamask.png" alt="">
//             </i>
//             <h2>Opening MetaMask...</h2>
//             <p>
//                 Confirm connection In the extension
//             </p>

//             <div class="loader"></div>
//         </div>
//     </div>
// </div>
//     `

//     let content

//     if (val === "kthulu") {
//         content = kthuluContent;
//     }
//     if (val === "other") {
//         content = otherContent;
//     }
//     if (val === "chrome") {
//         content = chromeContent;
//     }
//     if (val === "wallet") {
//         content = walletContent;
//     }

//     connectLayerInner.innerHTML = content

// }

function layerOpen(layerName) {
    document.querySelector(`.layer-` + layerName).classList.add('layer-view');
    walletlayer = true;
}

function layerClose(el) {
    el.closest('.layer').classList.remove('layer-view')
}




// 메인넷 창
let isMainnetSelectOpen = false;

// 열기
function mainnetSelectOpen(event, value) {
    event.stopPropagation();
    const mainnetSelectLayer = document.querySelector(`.mainnet-select[value="`+value+`"]`);
    mainnetSelectLayer.classList.add('mainnet-select-open');
    isMainnetSelectOpen = true;
}

function mainnetSelectClose(e) {
    const mainnetSelectLayer = document.querySelectorAll('.mainnet-select');
    const mainnetCloseIcons = document.querySelectorAll('.mainnet-search i');
    const mainnetSelectList = document.querySelectorAll('.mainnet-select-list label > div');


    if (isMainnetSelectOpen === true) {
        let shouldClose = true; // 기본적으로 닫아야 함

        mainnetSelectLayer.forEach(element => {
            const isClickInsideSelect = element.contains(e.target);
            const isClickOnCloseIcon = Array.from(mainnetCloseIcons).includes(e.target);
            
            if (!isClickInsideSelect || isClickOnCloseIcon) {
                element.classList.remove('mainnet-select-open');
                shouldClose = false;
            }

            mainnetSelectList.forEach(function (item) {
                if (e.target === item) {
                    element.classList.remove('mainnet-select-open');
                    isMainnetSelectOpen = false;
                }
            });
        });

        if (shouldClose) {
            mainnetSelectLayer.forEach(element => {
                element.classList.remove('mainnet-select-open');
            });
            isMainnetSelectOpen = false;
        }
    }

}


document.addEventListener('click', mainnetSelectClose);




// 리스트 아래로
function nftListOpen(el) {
    const listItem = el.closest('.bridge-list');

    const nftbox = listItem.lastChild.previousSibling;
    let curHeight = nftbox.offsetHeight;
    let autoHeight = nftbox.scrollHeight;
    if (curHeight === 0) {
        nftbox.style.height = autoHeight + 'px';
        listItem.classList.add('bridge-list-open');
    } else {
        nftbox.style.height = '0';
        listItem.classList.remove('bridge-list-open');

    }
}

// nft-box height 0 
// listItem.classList.remove('bridge-list-open');

// 리스트 닫기
function nftListClose() {
    const listItemAll = document.querySelectorAll('.bridge-list');
    const listBoxAll = document.querySelectorAll('.nft-box');
    listItemAll.forEach(function (item) {
        item.classList.remove('bridge-list-open');
    });
    listBoxAll.forEach(function (item) {
        item.style.height = '0';
    });
}

// explorerMinView
function explorerMinView(el) {
    const exploreMin = el.children[1];
    exploreMin.classList.toggle('explorer-min-open');

    el.classList.toggle('iconChange');
}

// 브릿지탭
document.addEventListener('click', function () {
    const bridgeTap = document.querySelectorAll('input[name="bridge-tap"]');

    const portfolio = document.querySelector('.bridge-portfolio');
    const activity = document.querySelector('.bridge-activity');
    if (bridgeTap[0].checked) {
        portfolio.style.display = 'block';
        activity.style.display = 'none';
    } else {
        portfolio.style.display = 'none';
        activity.style.display = 'block';
    }
})

// mainnetchange
// let ismainnetChangeView = false;

// function mainnetChangeView() {
//     const mainnetChangeLayer = document.querySelector('.layer-mainnet-change');
//     mainnetChangeLayer.classList.add('layer-mainnet-change-view');
//     ismainnetChangeView = true;

// }
// function mainnetChangeClose(e) {
//     const mainnetChangeLayer = document.querySelector('.layer-mainnet-change');
//     const mainnetChangeBt = document.querySelector('.mainnet-change-bt');
//     if (ismainnetChangeView === true) {
//         if (!mainnetChangeBt.contains(e.target)) {
//             mainnetChangeLayer.classList.remove('layer-mainnet-change-view');
//             ismainnetChangeView = false;
//         }
//     }
// }

// document.addEventListener('click', mainnetChangeClose)



// function brdigeReset() {
//     const mainnetBox = document.querySelector('.bridge-nft-from');
//     const emptyMainnet = `<i class="token-icon">
//     <img src="../img/noimg.svg" alt="">
//     </i>
//     <div>
//         <span>From</span>
//         <p>-</p>
//     </div>`
//     console.log(mainnetBox)

    
// }


// function nftListCkd(evnet) {
//     event.stopPropagation(); // 이벤트 전파 중단
//     const nftCkd = document.querySelector('input[name="nft-list"]:checked');
//     if (nftCkd) {
//         console.log(nftCkd.value);
//     }
// }
async function toastAlert() {
    const [account] = await getRequestAccounts();

    try {
        await copyClipboard(account);
        console.log('Text successfully copied to clipboard');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }

    const toastAlert = document.querySelector('.toast_alert');
    toastAlert.style.opacity = '1';
    toastAlert.style.transform = 'translateX(-50%) translateY(0rem)';

    setTimeout(()=>{
        toastAlert.style.opacity = '0';
        toastAlert.style.transform = 'translateX(-50%) translateY(5rem)';
    }, 3000);
}
