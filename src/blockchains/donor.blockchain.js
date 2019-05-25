/**
 * 
 * This blockchain contains all things that will relate to donors
 * and donor information.
 *
 *
 *
 *
 *
 **/ 


const sha256 = require('sha256');
const currentNodeURL = process.argv[3]
const uuid = require('uuid/v1');


/**
 * Blockchain contructor
 *
 **/

function DonorBlockchain() {
	this.chain = [];
	this.pendingDonors = [];

	this.currentNodeURL = currentNodeURL;
	this.networkNodes = [];

	// Create genesis block
	this.createNewBlock(1,'0','0');
} // end Blockchain() constructor



/**
 * function createNewBlock - Creates a new block and adds to to the existing blockchain
 *
 *	@param {integer} nonce - The nonce of this block
 *	@param {string} previousBlockHash - The hash of the previous block
 *	@param {string} hash - The hash of this block
 *
 *	@return {object} - The complete block that was added to the blockchain
 *
 *
 **/

DonorBlockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		donors:  this.pendingDonors,
		nonce,
		hash,
		previousBlockHash
	};

	this.pendingDonors = [];
	this.chain.push(newBlock);
	return newBlock;
}; // end createNewBlock


/**
 *
 * function getLastBlock - returns the last block on the blockchain.
 *
 *	@param {none}
 *
 *	@return {object} - The last block that was added to the blockchain
 *
 */

DonorBlockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length-1];
}; // end getLastBlock()



DonorBlockchain.prototype.createNewDonor = function ({ email, fname, lname, organization }) {
	const newDonor = {
		donorId: uuid().split('-').join(''),
		email: email,
		fname: fname,
		lname: lname,
		organization: organization
	};
	return newDonor;
}; // end createNewDonor()


DonorBlockchain.prototype.addDonorToPendingDonors = function(donorObj) {
	this.pendingDonors.push(donorObj);
	// why does this return the id of the next block?
	return this.getLastBlock().index + 1;
};

DonorBlockchain.prototype.hashBlock = function(nonce, previousBlockHash, currentBlockData) {
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
DonorBlockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce=0;

	let hash = this.hashBlock(nonce, previousBlockHash, currentBlockData);

	while(hash.substring(0,4)!=='0000') {
		nonce++;
		hash = this.hashBlock(nonce, previousBlockHash,currentBlockData);
	}

	//console.log(`${nonce}::${hash}`);

	return nonce;
}; // end proofOfWork

DonorBlockchain.prototype.isChainValid = function(blockchain) {
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


DonorBlockchain.prototype.getBlock = function(blockHash) {
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

DonorBlockchain.prototype.getDonorData = function({ donorId }) {
	const donorData = {};
	let found = false;

	for(let x=this.chain.length-1; x>0; x--) {
		const theBlock = this.chain[x];
		theBlock.donors.forEach((donor) => {
			if(donors.donorId == donorId) {
				donorData = donor;
				found = true;
			}
		});

		if(found) {
			break;
		}
	}

	return {
		donorData
	}
};



//////////////////// below here needs reviewed for donor content


/**
 * I do not think this (or its equivalent form) is needed.. . commenting out
   but keeping for now. . . 

DonorBlockchain.prototype.getTransaction = function(transactionID) {
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

 *
 **/

module.exports = DonorBlockchain;
