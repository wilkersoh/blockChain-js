const { BlockChain, Transaction } = require('./blockchain')
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const myKey = ec.keyFromPrivate(
  "bd12c017a9e610d936b2a6a6df1de0b8693e66ab515b153a82966c60a55c29be"
);
const myWalletAddress = myKey.getPublic('hex');

let yzCoin = new BlockChain();

const tx1 = new Transaction(myWalletAddress, 'other public key goes here from the people address.', 10)
tx1.signTransaction(myKey);
yzCoin.addTransaction(tx1)

console.log("\n Starting the miner....")
yzCoin.minePendingTransactions(myWalletAddress);

console.log("\n Balance of is, ", yzCoin.getBalanceOfAddress(myWalletAddress));

// yzCoin.chain[1].transactions[0].amount = 1;

console.log("is Chain valid", yzCoin.isChainValid())

