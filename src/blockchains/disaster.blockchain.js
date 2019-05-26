/**
 *
 *
 * This blockchain contains all things that will relate to disasters
 * and disaster information.
 *
 *
 **/ 

const sha256 = require('sha256');
const currentNodeURL = process.argv[3]
const uuid = require('uuid/v1');


/**
 *
 * Disaster blockchain contructor
 *
 **/

function DisasterBlockchain() {
	this.chain = [];
	this.pendingDisasters = [];

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

DisasterBlockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		disasters:  this.pendingDisasters,
		nonce,
		hash,
		previousBlockHash
	};

	this.pendingDisasters = [];
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

DisasterBlockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length-1];
}; // end getLastBlock()


/**
 *
 * function createNewDisaster - creates a new disaster object.
 *
 *	@param {string} latitude - The latitude of the disaster
 *	@param {string} longitude - The longitude of the disaster
 *	@param {string} city - The nearest city of the disaster
 *	@param {string} state - The nearest state of the disaster
 *	@param {string} country - The nearest country of the disaster
 *	@param {string} type - The type of the disaster (e.g. Wildfire, Hurricane, Typhoon, Earthquake)
 *	@param {string} description - Freeform notes about the disaster
 *
 *	@return {object} - A donor object that can be used in the blockchain
 *
 *
 **/


DisasterBlockchain.prototype.createNewDisaster = function ({ latitude, longitude, city, state=null, country, type, description }) {
	const newDisaster = {
		disasterID: uuid().split('-').join(''),
		latitude,
		longitude,
		city,
		state,
		country,
		type,
		description
	};
	return newDisaster;
}; // end createNewDisaster()



/**
 *
 * function addDisasterToPendingDisasters - adds a disaster to the pendingDisasters array, which
 *		will be added to the blockchain when the next block is mined.
 *
 *	@param {object} disasterObj - A disaster object, created by the createNewDisaster method
 *
 *	@return {integer} - the index of the next block that will be mined.
 *
 **/

DisasterBlockchain.prototype.addDisasterToPendingDisasters = function(disasterObj) {
	this.pendingDisasters.push(disasterObj);
	return this.getLastBlock().index + 1;
};


/**
 *
 * function hashBlock - returns the hash of a block given the parameters
 *
 *	@param {integer} nonce - The nonce to use for the block.
 *	@param {string} previousBlockHash - the hash of the previous block in the blockchain
 *	@param {object} currentBlockData - an object containing a disaster object as creates 
 *									   in the createNewDisaster method 
 *
 *	@return {string} - The sha256 of this data.
 *
 *
 **/

DisasterBlockchain.prototype.hashBlock = function(nonce, previousBlockHash, currentBlockData) {
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
 *	@param {object} currentBlockData - an object containing a disaster object as creates 
 *									   in the createNewDisaster method 
 *
 *	@return {integer} - The nonce that generates an acceptable hash
 *	
 *
 **/

DisasterBlockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
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

DisasterBlockchain.prototype.isChainValid = function(blockchain) {
	let isValidChain = true;

	for(var i=1; i<blockchain.length;i++) {

		const currentBlock = blockchain[i];
		const previousBlock = blockchain[i-1];

		// check the previousBlockHash of a block with the hash of the previous block
		if(currentBlock.previousBlockHash !== previousBlock.hash) {
			isValidChain = false;
		}

		// verify the block hash.  Just make sure it starts with "0000"
		const blockHash = this.hashBlock(currentBlock.nonce, previousBlock.hash, {disasters: currentBlock.disasters, index: currentBlock.index});
		if(blockHash.substring(0,4) !== '0000') {
			isValidChain = false;
		}
	}

	// check genesis block
	const genesisBlock = blockchain[0];
	if(genesisBlock.nonce !==1 || genesisBlock.hash !=='0' || genesisBlock.previousBlockHash !=='0' || genesisBlock.disasters.length !==0) {
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

DisasterBlockchain.prototype.getBlock = function(blockHash) {
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
 * function getDisasterData - returns the information of a disaster with a given disasterID
 *
 *	@param {string} disasterID - the ID of the disaster
 *
 *	@return {object} - An object with the disaster information.  Returns an empty object 
 *					   if the disaster is not found.
 *
 **/
 
DisasterBlockchain.prototype.getDisasterData = function({ disasterID }) {
	const disasterData = {};
	let found = false;

	for(let x=this.chain.length-1; x>0; x--) {
		const theBlock = this.chain[x];
		theBlock.disasters.forEach((disaster) => {
			if(disaster.disasterID == disasterID) {
				disasterData = disaster;
				found = true;
			}
		});

		if(found) {
			break;
		}
	}

	return {
		disasterData
	}
};




module.exports = DisasterBlockchain;