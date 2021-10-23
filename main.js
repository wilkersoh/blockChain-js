const { BlockChain, Transaction } = require('./blockchain')
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const myKey = ec.keyFromPrivate(
  "c8389a01dd10d46f46a2180472327af15f82121446d45ac987246ea9f7923626"
);
const myWalletAddress = myKey.getPublic('hex');

let yzCoin = new BlockChain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here.', 10)
tx1.signTransaction(myKey);
yzCoin.addTransaction(tx1)

console.log("\n Starting the miner....")
yzCoin.minePendingTransactions(myWalletAddress);

console.log("\n Balance of is, ", yzCoin.getBalanceOfAddress(myWalletAddress));

// yzCoin.chain[1].transactions[0].amount = 1;

console.log("is Chain valid", yzCoin.isChainValid())

