var blockchairCaller = require('./blockchair_api_caller.js');
var trxCaller = require('./trx_api_caller.js');
var chainSoCaller = require('./chain_so_api_caller.js');
var dogechainCaller = require('./dogechain_api_caller.js');
var zchainCaller = require('./zchain_api_caller.js');
var bitinfochartsCaller = require('./bitinfocharts_api_caller.js');
var rippleCaller = require('./ripple_api_caller.js');

var interval = setInterval(function(){
	//chainSoCaller.getData();
	//bitinfochartsCaller.getData();
	blockchairCaller.getData();
	trxCaller.getData();
	dogechainCaller.getData();
	zchainCaller.getData();
	rippleCaller.getData();
}, 5000);
