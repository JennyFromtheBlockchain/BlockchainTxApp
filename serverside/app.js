//Transactions graph - https://neodepot.org/charts/transactions-count-date
//                      Verge - https://verge-blockchain.info/info
var bitinfochartsCaller = require('./bitinfocharts_api_caller.js');
var vechainCaller = require('./vechain_api_caller.js');

var service = require('./service.js');

var interval = setInterval(function(){
	// chainSoCaller.getData();
	// bitinfochartsCaller.getData();

	// vechain is no longer active
	// vechainCaller.getData();

	service.updateBlockchainData();
}, 5000);