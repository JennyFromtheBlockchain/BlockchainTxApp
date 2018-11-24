var blockchainCaller = require('./blockchair_api_caller.js');
var trxCaller = require('./trx_api_caller.js');

var interval = setInterval(function(){
	blockchainCaller.getData();
	trxCaller.getData();
}, 5000);
