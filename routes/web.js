var express = require('express');
const web = require("../libs/web");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
* 함수명 : getBalance
* 기능 : 잔고조회
* 설명 : 컨트렉트를 통신하여 잔고를 조회합니다.
* 파라메타 : 메인넷, 퍼블릭키주소
*/
router.get('/getBalance', async function(req, res, next) {
    try{
        const network = req.query.network;
        const account = req.query.account;
        console.log("getBalance 접속 성공!!! : ============= " + network +" / " + account);
        const getBalance = await web.getBalance(network, account);
        res.json(getBalance);
    }catch(err){
        console.log(err);
        res.json({ result: "FAIL", value: [] });
    }

});

/**
* 함수명 : getGasPrice
* 기능 : 가스비 조회
* 설명 : 컨트렉트를 통신하여 가스비를 조회합니다.
* 파라메타 : 메인넷
*/
router.get('/getGasPrice/:network', async function(req, res, next) {
    try{
        const network = req.params.network;
        console.log("getGasPrice 접속 성공!!! : ============= " + network);
        const getGasPrice = await web.getGasPriceAsync(network);
        res.json(getGasPrice);
    }catch(err){
        console.log(err);
        res.json({ result: "FAIL", value: [] });
    }

});

/**
* 함수명 : getBridgeFee
* 기능 : 브릿지 수수료 조회
* 설명 : 컨트렉트 함수를 통하여 브릿지 수수료를 조회합니다.
* 파라메타 : 퍼블릭키주소, 타입
*/
router.get('/getCoinBridgeFee/:network/:toNetwork', async function(req, res, next) {
    try{
        const network = req.params.network;
        const toNetwork = req.params.toNetwork;
        console.log("getCoinBridgeFee 접속 성공!!! : ============= " + network +" / " + toNetwork);
        const getCoinBridgeFee = await web.getCoinBridgeTotalFeeAsync(network, toNetwork);
        res.json(getCoinBridgeFee);
    }catch(err){
        console.log(err);
        res.json({ result: "FAIL", value: [] });
    }

});

/**
* 함수명 : getBridgeFee
* 기능 : 브릿지 수수료 조회
* 설명 : 컨트렉트 함수를 통하여 브릿지 수수료를 조회합니다.
* 파라메타 : 퍼블릭키주소, 타입
*/
router.get('/getBridgeFee/:network/:toNetwork/:collection_id/:typed', async function(req, res, next) {
    try{
        const network = req.params.network;
        const toNetwork = req.params.toNetwork;
        const collection_id = req.params.collection_id;
        const typed = req.params.typed;
        console.log("getBridgeFee 접속 성공!!! : ============= " + network +" / " + toNetwork +" / " + collection_id +" / " + typed);
        const getBridgeFee = await web.getBridgeTotalFeeAsync(network, toNetwork, collection_id, typed);
        res.json(getBridgeFee);
    }catch(err){
        console.log(err);
        res.json({ result: "FAIL", value: [] });
    }

});

/**
* 함수명 : getHistory
* 기능 : 거래내역 조회
* 설명 : 데이터베이스를 통하여 거래내역을 조회합니다.
* 파라메타 : 퍼블릭키주소, 타입
*/
router.get('/history/:account/:type', async function(req, res, next) {
    try{
        const account = req.params.account;
        const type = req.params.type;
        console.log("gethistory 접속 성공!!! : ============= " + account + " / " + type);
        const types = type=="nft" ? ["erc721","erc1155"] : ["ether","erc20"];
        const getHistory = await web.getHistory(account, types);
        res.json(getHistory);
    }catch(err){
        console.log(err);
        res.json({ result: "FAIL", value: [] });
    }

});

/**
* 함수명 : tokenBridgeAppoveAsync
* 기능 : 토큰 승인
* 설명 : 컨트렉트 함수를 통해 bridge contract에 token 권한을 승인합니다.
* 파라메타 : 퍼블릭키주소, 타입
*/
router.post('/tokenBridgeAppoveAsync', async function(req, res, next) {
    try{
        let network = req.body.network;
        let account = req.body.account;
        let to_network = req.body.to_network;
        let token_address = req.body.token_address;
        let amount = req.body.amount;
        console.log("tokenBridgeAppoveAsync 접속 성공!!! : ============= " + network + " / " + account + " / " + to_network + " / " + token_address + " / " + amount);
        const tokenBridgeAppove = await web.tokenBridgeAppoveAsync(network, account, to_network, token_address, amount);
        res.json(tokenBridgeAppove);
    }catch(err){
        console.log(err);
        res.json({ result: "FAIL", value: [] });
    }

});

/**
* 함수명 : tokenBridgeAsync
* 기능 : 토큰 브릿지
* 설명 : 컨트렉트 함수를 통해 bridge를 실행합니다.
* 파라메타 : 퍼블릭키주소, 타입
*/
router.post('/tokenBridgeAsync', async function(req, res, next) {
    try{
        let network = req.body.network;
        let account = req.body.account;
        let to_network = req.body.to_network;
        let token_address = req.body.token_address;
        let amount = req.body.amount;
        console.log("tokenBridgeAppoveAsync 접속 성공!!! : ============= " + network + " / " + account + " / " + to_network + " / " + token_address + " / " + amount);
        let bridgeResult;
        if(token_address)  bridgeResult = await web.bridgeErc20AsyncAsync(network, account, to_network, token_address, amount);
        else bridgeResult = await web.bridgeCoinAsync(network, account, to_network, amount);
        res.json(bridgeResult);
    }catch(err){
        console.log(err);
        res.json({ result: "FAIL", value: [] });
    }

});


module.exports = router;
