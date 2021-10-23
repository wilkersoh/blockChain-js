var SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  signTransaction(signingKey) {
    if(signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions from other wallets!')
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isValid() {
    if(this.fromAddress === null) return true;
    if(!this.signature || this.signature.length === 0) throw new Error("No Signature in this transaction");

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature)
  }
}

class Block {
  constructor( timestamp, transactions, previousHash = '') {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) + this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    console.log("default hash: ", this.hash)
    while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      /**
       * 找到 diffuculty 規定的 0 才 停止 loop
       * difficulty = 4
       * this.hash = 07b125de1398e0393c1fc96370f2d559ea650ffb179a1de704bf7e76e672a03f
       * this.hash.substring(0, 4) = 07b1
       * while(07b1 !== 0000) {
       *  找到後 他會 overwrite 掉之前 initial的 hash
       * }
       *
       * Note: SHA256密碼學 fn generate 到 越多0 在前面 越慢
       */
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log("Block mined: " + this.hash)
  }

  hasValidTransactions() {
    for(const tx of this.transactions) {
      if(!tx.isValid()) return false;
    }

    return true;

  }
}

class BlockChain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block(0, "18/10/2021", "Genesis block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward)
    this.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log("block succesuffly mined")
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  addTransaction(transaction) {
    if(!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must be from address")
    }

    if(!transaction.isValid()) {
      throw new Error("Cannt add invalid transaction")
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    for(const block of this.chain) {
      for(const trans of block.transactions) {
        if(trans.fromAddress === address) {
          balance -= trans.amount
        }
        if(trans.toAddress === address) {
          balance += trans.amount
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for(let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if(!currentBlock.hasValidTransactions()) return false;

      if(currentBlock.hash !== currentBlock.calculateHash()) return false;

      if (currentBlock.previousHash !== previousBlock.calculateHash()) return false;
    }

    return true;
  }
}


module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;
