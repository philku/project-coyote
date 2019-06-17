/**
 *
 *
 * This blockchain contains all things that will relate to resources
 * and resource information.
 *
 *
 **/ 

const sha256 = require('sha256');
const currentNodeURL = process.argv[3]
const uuid = require('uuid/v1');


/**
 *
 * Resource blockchain contructor
 *
 **/

function ResourceBlockchain() {
	this.chain = [];
	this.pendingResources = [];

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

ResourceBlockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		resources:  this.pendingResources,
		nonce,
		hash,
		previousBlockHash
	};

	this.pendingResources = [];
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

ResourceBlockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length-1];
}; // end getLastBlock()



ResourceBlockchain.prototype.createNewResource = function ({ title, description, UNNumber }) {
	const newResource = {
		resourceID: uuid().split('-').join(''),
		title,
		description,
		UNNumber
	};
	return newResource;
}; // end createNewResource()




ResourceBlockchain.prototype.addResourceToPendingResources = function(resourceObj) {
	this.pendingResources.push(resourceObj);
	return this.getLastBlock().index + 1;
};


/**
 *
 * function hashBlock - returns the hash of a block given the parameters
 *
 *	@param {integer} nonce - The nonce to use for the block.
 *	@param {string} previousBlockHash - the hash of the previous block in the blockchain
 *	@param {object} currentBlockData - an object containing a resource object as creates 
 *									   in the createNewResource method 
 *
 *	@return {string} - The sha256 of this data.
 *
 *
 **/

ResourceBlockchain.prototype.hashBlock = function(nonce, previousBlockHash, currentBlockData) {
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
 *	@param {object} currentBlockData - an object containing a resource object as creates 
 *									   in the createNewResource method 
 *
 *	@return {integer} - The nonce that generates an acceptable hash
 *	
 *
 **/

ResourceBlockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce=0;

	let hash = this.hashBlock(nonce, previousBlockHash, currentBlockData);

	while(hash.substring(0,4)!=='0000') {
		nonce++;
		hash = this.hashBlock(nonce, previousBlockHash,currentBlockData);
	}

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

ResourceBlockchain.prototype.isChainValid = function(blockchain) {
	let isValidChain = true;

	for(var i=1; i<blockchain.length;i++) {

		const currentBlock = blockchain[i];
		const previousBlock = blockchain[i-1];

		// check the previousBlockHash of a block with the hash of the previous block
		if(currentBlock.previousBlockHash !== previousBlock.hash) {
			isValidChain = false;
		}

		// verify the block hash.  Just make sure it starts with "0000"
		const blockHash = this.hashBlock(currentBlock.nonce, previousBlock.hash, {resources: currentBlock.resources, index: currentBlock.index});
		if(blockHash.substring(0,4) !== '0000') {
			isValidChain = false;
		}
	}

	// check genesis block
	const genesisBlock = blockchain[0];
	if(genesisBlock.nonce !==1 || genesisBlock.hash !=='0' || genesisBlock.previousBlockHash !=='0' || genesisBlock.resources.length !==0) {
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

ResourceBlockchain.prototype.getBlock = function(blockHash) {
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


ResourceBlockchain.prototype.getResourceDataByID = function( resourceID ) {
	let resourceData = {};
	let found = false;

	for(let x=this.chain.length-1; x>0; x--) {
		const theBlock = this.chain[x];
		theBlock.resources.forEach((resource) => {
			if(resource.resourceID == resourceID) {
				resourceData = resource;
				found = true;
			}
		});

		if(found) {
			break;
		}
	}

	return resourceData;
};

ResourceBlockchain.prototype.getResourceDataByNumber = function( resourceNumber ) {
	let resourceData = {};
	let found = false;

	for(let x=this.chain.length-1; x>0; x--) {
		const theBlock = this.chain[x];
		theBlock.resources.forEach((resource) => {
			if(resource.UNNumber == resourceNumber) {
				resourceData = resource;
				found = true;
			}
		});

		if(found) {
			break;
		}
	}

	return resourceData;
};


/**
 *
 * function mine - mines the next block
 *
 *	@return {object} - The complete block that was added to the blockchain
 *
 **/
ResourceBlockchain.prototype.mine = function () {
    const lastBlock = this.getLastBlock();
    const previousBlockHash = lastBlock.hash;

    // currentBlockData can take anything you want to put in here
    const currentBlockData = {
        disasters: this.pendingDisasters,
        index: lastBlock.index + 1
    };
    const nonce = this.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = this.hashBlock(nonce, previousBlockHash, currentBlockData);
    const newBlock = this.createNewBlock(nonce, previousBlockHash, blockHash);

    return newBlock;
};




module.exports = ResourceBlockchain;
