/**
 * Main file that contains all functions to interact with the blockchain
 *
 *
 *
 * @ToDo
 *	1) Convert this to a class in project 2 (section 2 lesson 10)
 *
 *
 **/ 

/**
 * Questions / things to try
 *	1) Can you read the chain in the constructor from a file/files?
 *
 *
 *
 **/

const sha256 = require('sha256');
const currentNodeURL = process.argv[3]
const uuid = require('uuid/v1');

function Blockchain() {
	this.chain = [];
	this.pendingTransactions = [];

	this.currentNodeURL = currentNodeURL;
	this.networkNodes = [];

	// Create genesis block
	this.createNewBlock(1,'0','0');
} // end Blockchain() constructor



// Take pending transaction, create a new block, and add it to the chain.
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		transactions:  this.pendingTransactions,
		nonce,
		hash,
		previousBlockHash
	};

	this.pendingTransactions = [];
	this.chain.push(newBlock);
	return newBlock;
}; // end createNewBlock

Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length-1];
}; // end getLastBlock()




Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
	const newTransaction = {
		amount: amount,
		sender: sender,
		recipient: recipient,
		transactionID: uuid().split('-').join('')
	};
	return newTransaction;
}; // end createNewTransaction()


Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
	this.pendingTransactions.push(transactionObj);
	return this.getLastBlock().index + 1;
};

Blockchain.prototype.hashBlock = function(nonce, previousBlockHash, currentBlockData) {
	// concat the previousBlockHash, the currentBlock Data, and the nonce to ensure uniqueness.
	const data = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(data);
	return hash;
}; // end hashBlock()

/**
 * function proofOfWork - cycles through various nonces to find one that generates an acceptable hash
 *	
 *
 **/
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce=0;

	let hash = this.hashBlock(nonce, previousBlockHash, currentBlockData);

	while(hash.substring(0,4)!=='0000') {
		nonce++;
		hash = this.hashBlock(nonce, previousBlockHash,currentBlockData);
	}

	//console.log(`${nonce}::${hash}`);

	return nonce;
}; // end proofOfWork

Blockchain.prototype.isChainValid = function(blockchain) {
	let isValidChain = true;

	for(var i=1; i<blockchain.length;i++) {

		const currentBlock = blockchain[i];
		const previousBlock = blockchain[i-1];

		// check the previousBlockHash of a block with the hash of the previous block
		if(currentBlock.previousBlockHash !== previousBlock.hash) {
			isValidChain = false;
		}

		// verify the block hash.  Just make sure it starts with "0000"
		const blockHash = this.hashBlock(currentBlock.nonce, previousBlock.hash, {transactions: currentBlock.transactions, index: currentBlock.index});
		if(blockHash.substring(0,4) !== '0000') {
			isValidChain = false;
		}
	}

	// check genesis block
	const genesisBlock = blockchain[0];
	if(genesisBlock.nonce !==1 || genesisBlock.hash !=='0' || genesisBlock.previousBlockHash !=='0' || genesisBlock.transactions.length !==0) {
		isValidChain = false;
	}

	return isValidChain;
}; // end isChainValid()


Blockchain.prototype.getBlock = function(blockHash) {
	// get a block with a certain blockHash and return it
	let correctBlock = null;

	this.chain.forEach((block) => {
		// need to break out of this forEach if/when the block is found
		if(block.hash === blockHash) {
			correctBlock = block;
		}
	});

	return correctBlock;
};

Blockchain.prototype.getTransaction = function(transactionID) {
	// get a block with a certain blockHash and return it
	let correctBlockTransaction = null;
	let correctBlock = null;

	this.chain.forEach((block) => {
		block.transactions.forEach((transaction) => {
			if(transaction.transactionID === transactionID) {
				correctTransaction = transaction;
				correctBlock = block;
			}
		});

	});

	return {
		transaction: correctTransaction,
		block: correctBlock
	};
};

Blockchain.prototype.getAddressData = function(address) {
	const addressTransactions = [];

	this.chain.forEach((block) => {
		block.transactions.forEach((transaction) => {
			if(transaction.sender === address || transaction.recipient === address) {
				addressTransactions.push(transaction);
			}
		});
	});

	// now calculate balance
	let balance = 0.0;
	addressTransactions.forEach((transaction) => {
		if(transaction.sender === address) {
			balance -= transaction.amount;
		} else if(transaction.recipient === address) {
			balance += transaction.amount;
		}
	});

	return {
		addressTransactions: addressTransactions,
		addressBalance: balance
	};
};



module.exports = Blockchain;