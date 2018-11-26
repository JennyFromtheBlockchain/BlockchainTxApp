//Transactions graph - https://neodepot.org/charts/transactions-count-date
//                      Verge - https://verge-blockchain.info/info
var bitinfochartsCaller = require('./bitinfocharts_api_caller.js');
var chainSoCaller = require('./chain_so_api_caller.js');
var blockchairCaller = require('./blockchair_api_caller.js');
var trxCaller = require('./trx_api_caller.js');
var dogechainCaller = require('./dogechain_api_caller.js');
var zchainCaller = require('./zchain_api_caller.js');
var rippleCaller = require('./ripple_api_caller.js');
var minergateCaller = require('./minergate_api_caller.js');
var coinerexplorerCaller = require('./coinexplorer_api_caller.js');
var vechainCaller = require('./vechain_api_caller.js');
var coinmetricsCaller = require('./coinmetrics_api_caller.js');

var service = require('./service.js');

var interval = setInterval(function(){
	//chainSoCaller.getData();
	//bitinfochartsCaller.getData();

	// vechain is no longer active
	//vechainCaller.getData();

	// blockchairCaller.getData();
	// trxCaller.getData();
	// dogechainCaller.getData();
	// zchainCaller.getData();
	// rippleCaller.getData();
	// minergateCaller.getData();
	// coinerexplorerCaller.getData();
	// //TODO coinmetricsCaller only needs to be called every 12 hours as the data is from the last 24 hours
	// coinmetricsCaller.getData();
	service.updateBlockchainData();
}, 5000);