/**
 * 
 * This blockchain contains all things that will relate to donors
 * and donor information.
 *
 *
 **/ 


const sha256 = require('sha256');
const currentNodeURL = process.argv[3]
const uuid = require('uuid/v1');


/**
 *
 * Donor blockchain contructor
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


/**
 *
 * function createNewDonor - creates a new donor object.
 *
 *	@param {string} email - The email of the donor
 *	@param {string} fname - The first name of the donor
 *	@param {string} lname - The last name of the donor
 *	@param {string} organization - the organization that the donor is associated with
 *
 *	@return {object} - A donor object that can be used in the blockchain
 *
 *
 **/


DonorBlockchain.prototype.createNewDonor = function ({ email, fname, lname, organization }) {
	const newDonor = {
		donorID: uuid().split('-').join(''),
		email: email,
		fname: fname,
		lname: lname,
		organization: organization
	};
	return newDonor;
}; // end createNewDonor()


/**
 *
 * function addDonorToPendingDonors - adds a donor to the pendingDonors array, which
 *		will be added to the blockchain when the next block is mined.
 *
 *	@param {object} donorObj - A donor object, created by the createNewDonor method
 *
 *	@return {integer} - the index of the next block that will be mined.
 *
 **/

DonorBlockchain.prototype.addDonorToPendingDonors = function({ donorObj }) {
	this.pendingDonors.push(donorObj);
	// why does this return the id of the next block?
	return this.getLastBlock().index + 1;
};


/**
 *
 * function hashBlock - returns the hash of a block given the parameters
 *
 *	@param {integer} nonce - The nonce to use for the block.
 *	@param {string} previousBlockHash - the hash of the previous block in the blockchain
 *	@param {object} currentBlockData - an object containing the blockData.  For donors, 
 *							{
 *								donors: Array of donor objects
 *								index: The index of the current block being mined
 *							}
 *
 *	@return {string} - The sha256 of this data.
 *
 *
 **/

DonorBlockchain.prototype.hashBlock = function(nonce, previousBlockHash, currentBlockData) {
	// concat the previousBlockHash, the currentBlock Data, and the nonce to ensure uniqueness.
	const data = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(data);
	return hash;
}; // end hashBlock()

/**
 * function proofOfWork - Cycles through various nonces to find one that 
 *						  generates an acceptable hash with a specified 
 *						  number of leading zeros.
 *
 *	@param {string} previousBlockHash - the hash of the previous block in the blockchain
 *	@param {object} currentBlockData - an object containing the blockData.  For donors, 
 *							{
 *								donors: Array of donor objects
 *								index: The index of the current block being mined
 *							}
 *
 *	@return {integer} - The nonce that generates an acceptable hash
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

/**
 *
 * function isValidChain - Determines whether the current chain is valid
 *
 *	@param {array} - The blockchain to analyze
 *
 *	@return {boolean} - Whether the blockchain is valid
 *
 **/

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
		const blockHash = this.hashBlock(currentBlock.nonce, previousBlock.hash, {donors: currentBlock.donors, index: currentBlock.index});
		if(blockHash.substring(0,4) !== '0000') {
			isValidChain = false;
		}
	}

	// check genesis block
	const genesisBlock = blockchain[0];
	if(genesisBlock.nonce !==1 || genesisBlock.hash !=='0' || genesisBlock.previousBlockHash !=='0' || genesisBlock.donors.length !==0) {
		isValidChain = false;
	}

	return isValidChain;
}; // end isChainValid()


/**
 *
 * function getBlock - return a block with the given hash
 *
 *	@param {string} - The block hash to search for
 *
 *	@return {object | null} - The block with the given hash.  null if the has is not found.
 *
 **/

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

/**
 *
 * function getDonorData - returns the information of a donor with a given donorID
 *
 *	@param {string} donorID - the ID of the donor
 *
 *	@return {object} - An object with the donor information.  Returns an empty object 
 *					   if the donor is not found.
 *
 **/
 
DonorBlockchain.prototype.getDonorData = function({ donorID }) {
	const donorData = {};
	let found = false;

	for(let x=this.chain.length-1; x>0; x--) {
		const theBlock = this.chain[x];
		theBlock.donors.forEach((donor) => {
			if(donors.donorID == donorID) {
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
