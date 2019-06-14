const sha256 = require('sha256');
const currentNodeURL = process.argv[3]
const uuid = require('uuid/v1');

function DonationBlockchain() {
	this.chain = [];
	this.pendingDonations = [];

	this.currentNodeURL = currentNodeURL;
	this.networkNodes = [];

	// Create genesis block
	this.createNewBlock(1,'0','0');
} // end DonationBlockchain() constructor



// Take pending transaction, create a new block, and add it to the chain.
DonationBlockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		donations:  this.pendingDonations,
		nonce,
		hash,
		previousBlockHash
	};

	this.pendingDonation = [];
	this.chain.push(newBlock);
	return newBlock;
}; // end createNewBlock


DonationBlockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length-1];
}; // end getLastBlock()




DonationBlockchain.prototype.createNewDonation = function ({ dateTime, disasterID, donorID, resources, sendDate, arriveDate }) {
	const newDonation = {
		transactionID: uuid().split('-').join(''),
		dateTime: dateTime,
		disasterID: disasterID,
		donorID: donorID,
		resources: resources,
		sendDate: sendDate,
		arriveDate: arriveDate
	};
	return newDonation;
}; // end createNewDonation()


DonationBlockchain.prototype.addDonationToPendingDonations = function(donationObj) {
	this.pendingDonations.push(donationObj);
	return this.getLastBlock().index + 1;
};

DonationBlockchain.prototype.hashBlock = function(nonce, previousBlockHash, currentBlockData) {
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
DonationBlockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce=0;

	let hash = this.hashBlock(nonce, previousBlockHash, currentBlockData);

	while(hash.substring(0,4)!=='0000') {
		nonce++;
		hash = this.hashBlock(nonce, previousBlockHash,currentBlockData);
	}

	//console.log(`${nonce}::${hash}`);

	return nonce;
}; // end proofOfWork

DonationBlockchain.prototype.isChainValid = function(blockchain) {
	let isValidChain = true;

	for(var i=1; i<blockchain.length;i++) {

		const currentBlock = blockchain[i];
		const previousBlock = blockchain[i-1];

		// check the previousBlockHash of a block with the hash of the previous block
		if(currentBlock.previousBlockHash !== previousBlock.hash) {
			isValidChain = false;
		}

		// verify the block hash.  Just make sure it starts with "0000"
		const blockHash = this.hashBlock(currentBlock.nonce, previousBlock.hash, {donation: currentBlock.donations, index: currentBlock.index});
		if(blockHash.substring(0,4) !== '0000') {
			isValidChain = false;
		}
	}

	// check genesis block
	const genesisBlock = blockchain[0];
	if(genesisBlock.nonce !==1 || genesisBlock.hash !=='0' || genesisBlock.previousBlockHash !=='0' || genesisBlock.donations.length !==0) {
		isValidChain = false;
	}

	return isValidChain;
}; // end isChainValid()


DonationBlockchain.prototype.getBlock = function(blockHash) {
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
 * function mine - mines the next block
 *
 *	@return {object} - The complete block that was added to the blockchain
 *
 **/
DonationBlockchain.prototype.mine = function () {
    const lastBlock = this.getLastBlock();
    const previousBlockHash = lastBlock.hash;

    // currentBlockData can take anything you want to put in here
    const currentBlockData = {
        donations: this.pendingDonations,
        index: lastBlock.index + 1
    };
    const nonce = this.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = this.hashBlock(nonce, previousBlockHash, currentBlockData);
    const newBlock = this.createNewBlock(nonce, previousBlockHash, blockHash);

    return newBlock;
};


DonationBlockchain.prototype.getDonation = function(donationID) {
	// get a block with a certain blockHash and return it
	let correctBlockDonation = null;
	let correctBlock = null;

	this.chain.forEach((block) => {
		block.donations.forEach((donation) => {
			if(donation.donationID === donationID) {
				correctDonation = donation;
				correctBlock = block;
			}
		});
	});

	return {
		donation: correctDonation,
		block: correctBlock
	};
};


module.exports = DonationBlockchain;