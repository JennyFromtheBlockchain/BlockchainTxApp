class xrp_network_obj {
  constructor(blockchainTicker, txInterval, transactions, timestamp) {
    this.blockchainTicker = blockchainTicker;
    this.txInterval = txInterval;
    this.transactions = transactions;
    this.timestamp = timestamp;
  }
};

module.exports = xrp_network_obj;