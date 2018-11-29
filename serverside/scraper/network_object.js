class network_obj {
  constructor(blockchainTicker, blockNumber, txInterval, transactions, timestamp) {
    this.blockchainTicker = blockchainTicker;
    this.blockNumber = blockNumber;
    this.txInterval = txInterval;
    this.transactions = transactions;
    this.timestamp = timestamp;
  }
};
module.exports = network_obj;