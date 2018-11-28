class network_obj {
  constructor(blockchainTicker, blockNumber, transactions, timestamp) {
    this.blockchainTicker = blockchainTicker;
    this.blockNumber = blockNumber;
    this.transactions = transactions;
    this.timestamp = timestamp;
  }
};

module.exports = network_obj;