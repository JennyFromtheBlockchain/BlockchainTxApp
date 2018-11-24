var blockchainCaller = require('./blockchair_api_caller.js');
var trxCaller = require('./trx_api_caller.js');
var chainSoCaller = require('./chain_so_api_caller.js');
var dogechainCaller = require('./dogechain_api_caller.js');
var zchainCaller = require('./zchain_api_caller.js');

var interval = setInterval(function(){
	//chainSoCaller.getData();
	blockchainCaller.getData();
	trxCaller.getData();
	dogechainCaller.getData();
	zchainCaller.getData();
}, 5000);
