var express = require('express');
const nft = require("../libs/nft");
const path = require("path");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('nft', { title: 'Express' });
});

/* GET history page. */
router.get('/history/:account', function(req, res, next) {
  res.render('activity_nft', { title: 'Express' });
});

/**
* 함수명 : nftBridgeAppoveAsync
* 기능 : nft 승인
* 설명 : 컨트렉트 함수를 통해 bridge contract에 bridge 권한을 승인합니다.
* 파라메타 : 메인넷, 퍼블릭키. 목적지네트워크, 컬렉션아이디
*/
router.post('/nftBridgeAppoveAsync', async function(req, res, next) {
  try{
      let network = req.body.network;
      let account = req.body.account;
      let to_network = req.body.to_network;
      let collection_id = req.body.collection_id;
      console.log("nftBridgeAppoveAsync 접속 성공!!! : ============= " + network + " / " + account + " / " + to_network + " / " + collection_id);
      const nftBridgeAppove = await nft.nftBridgeAppoveAsync(network, account, to_network, collection_id);
      res.json(nftBridgeAppove);
  }catch(err){
      console.log(err);
      res.json({ result: "FAIL", value: [] });
  }

});

/**
* 함수명 : nftBridgeAsync
* 기능 : NFT 브릿지
* 설명 : 컨트렉트 함수를 통해 bridge를 실행합니다.
* 파라메타 : 퍼블릭키주소, 타입
*/
router.post('/nftBridgeAsync', async function(req, res, next) {
  try{
      let network = req.body.network;
      let account = req.body.account;
      let to_network = req.body.to_network;
      let collection_id = req.body.collection_id;
      let token_id = req.body.token_id;
      let amount = req.body.amount;
      console.log("tokenBridgeAppoveAsync 접속 성공!!! : ============= " + network + " / " + account + " / " + to_network + " / " + collection_id + " / " + token_id + " / " + amount);
      let bridgeResult;
      if(amount)  bridgeResult = await nft.bridgeErc1155Async(network, account, to_network, collection_id, token_id, amount);
      else bridgeResult = await nft.bridgeErc721Async(network, account, to_network, collection_id, token_id);
      res.json(bridgeResult);
  }catch(err){
      console.log(err);
      res.json({ result: "FAIL", value: [] });
  }

});

module.exports = router;