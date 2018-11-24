var eth = require('./eth_api_caller.js');
var blockchainCaller = require('./blockchain_explorer_api_caller.js');
var trxCaller = require('./trx_api_caller.js');

var interval = setInterval(function(){
	//eth.getBlockNumber();
	//blockchainCaller.getBtcData();
	//blockchainCaller.getEthData();
	//blockchainCaller.getBchData();
	//blockchainCaller.getLtcData();
	blockchainCaller.getData();
	trxCaller.getData();
}, 5000);
