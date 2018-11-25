var bitinfochartsCaller = require('./bitinfocharts_api_caller.js');
var chainSoCaller = require('./chain_so_api_caller.js');
var blockchairCaller = require('./blockchair_api_caller.js');
var trxCaller = require('./trx_api_caller.js');
var dogechainCaller = require('./dogechain_api_caller.js');
var zchainCaller = require('./zchain_api_caller.js');
var rippleCaller = require('./ripple_api_caller.js');
var minergateCaller = require('./minergate_api_caller.js');
var coinerexplorerCaller = require('./coinexplorer_api_caller.js');

var interval = setInterval(function(){
	//chainSoCaller.getData();
	//bitinfochartsCaller.getData();

	blockchairCaller.getData();
	trxCaller.getData();
	dogechainCaller.getData();
	zchainCaller.getData();
	rippleCaller.getData();
	minergateCaller.getData();
	coinerexplorerCaller.getData();
}, 5000);
