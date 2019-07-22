const sha256 = require('sha256');
const currentNodeURL = process.argv[3];
const uuid = require('uuid/v1');

/**
 * DisasterBlockchain Class
 */
class DisasterBlockchain{
	constructor(){
        this.chain = [];
        this.pendingDisasters = [];

        this.currentNodeURL = currentNodeURL;
        this.networkNodes = [];

        // Create genesis block
        this.createNewBlock(1,'0','0');
	}

    /**
	 * Creates a new block and adds to to the existing blockchain
     * @param {number} nonce - The nonce of this block
     * @param {string} previousBlockHash - The hash of the previous block
     * @param {string} hash - The hash of this block
     * @returns {{index: number, timestamp: number, disasters: Array, nonce: *, hash: *, previousBlockHash: *}} - The complete block that was added to the blockchain
     */
	createNewBlock(nonce, previousBlockHash, hash) {
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
	}

    /**
	 * Returns the last block on this blockchain
     * @returns {{index: number, timestamp: number, disasters: Array, nonce: *, hash: *, previousBlockHash: *}} - The last block that was added to the blockchain
     */
	getLastBlock(){
        return this.chain[this.chain.length-1];
	}

    /**
	 * Formats input into a disaster object with an ID
	 * @param {boolean} [isActive=true] - Whether the disaster is active
     * @param {string} latitude - The latitude of the disaster
     * @param {string} longitude - The longitude of the disaster
     * @param {string} city - The nearest city of the disaster
     * @param {string} [state=null] - The nearest state of the disaster
     * @param {string} country - The nearest country of the disaster
     * @param {string} type - The type of the disaster (e.g. Wildfire, Hurricane, Typhoon, Earthquake)
     * @param {string} description - Freeform notes about the disaster
     * @returns {{disasterID: string, isActive: boolean, latitude: *, longitude: *, city: *, state: *, country: *, type: *, description: *}} - A donor object that can be used in the blockchain
     */
    createNewDisaster({ isActive = true, latitude, longitude, city, state=null, country, type, description }) {
        return{
            disasterID: uuid().split('-').join(''),
            isActive,
            latitude,
            longitude,
            city,
            state,
            country,
            type,
            description
        };
	}

    /**
	 * adds a disaster to the pendingDisasters array, which will be added to the blockchain when the next block is mined.
     * @param {object} disasterObj - A disaster object, created by the createNewDisaster method
     * @returns {number} - the index of the next block that will be mined.
     */
	addDisasterToPendingDisasters(disasterObj) {
        this.pendingDisasters.push(disasterObj);
        return this.getLastBlock().index + 1;
	}

    /**
	 * returns the hash of a block given the parameters
     * @param {number} nonce - The nonce to use for the block.
     * @param {string} previousBlockHash - the hash of the previous block in the blockchain
     * @param {object} currentBlockData - an object containing a disaster object as creates in the createNewDisaster method
	 * @returns {string} - The sha256 of this data.
     */
    hashBlock(nonce, previousBlockHash, currentBlockData) {
        // concat the previousBlockHash, the currentBlock Data, and the nonce to ensure uniqueness.
        const data = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        return sha256(data);
	}

    /**
     * Cycles through various nonces to find one that generates an acceptable hash with a specified number of leading zeros.
     * @param {string} previousBlockHash - the hash of the previous block in the blockchain
     * @param {object} currentBlockData - an object containing the blockData.
     * @returns {number} - The nonce that generates an acceptable hash
     */
	proofOfWork(previousBlockHash, currentBlockData) {
        let nonce=0;

        let hash = this.hashBlock(nonce, previousBlockHash, currentBlockData);

        while(hash.substring(0,4)!=='0000') {
            nonce++;
            hash = this.hashBlock(nonce, previousBlockHash,currentBlockData);
        }

        return nonce;
	}

    /**
	 * Checks if the current chain is valid
     * @param {array} blockchain - The blockchain to analyze
     * @returns {boolean} - If the blockchain is valid
     */
	isChainValid(blockchain) {
        let isValidChain = true;

        for(let i=1; i<blockchain.length;i++) {

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
	}

    /**
     * return a block with the given hash
     * @param {string} blockHash - The block hash to search for
     * @returns {object | null} - The block with the given hash.  null if the has is not found.
     */
	getBlock(blockHash) {
        // get a block with a certain blockHash and return it
        let correctBlock = null;

        this.chain.forEach((block) => {
            // need to break out of this forEach if/when the block is found
            if(block.hash === blockHash) {
                correctBlock = block;
            }
        });

        return correctBlock;
	}

    /**
	 * returns the information of a disaster with a given disasterID
     * @param {string} disasterID - the ID of the disaster
     * @returns {{disasterData: {}}} - An object with the disaster information.  Returns an empty object if the disaster is not found.
     */
	getDisasterData({ disasterID }) {
        let disasterData = {};
        let found = false;

        for(let x=this.chain.length-1; x>0; x--) {
            const theBlock = this.chain[x];
            theBlock.disasters.forEach((disaster) => {
                if(disaster.disasterID === disasterID) {
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
	}

    /**
	 * mines the next block
     * @returns {{index: number, timestamp: number, disasters: Array, nonce: *, hash: *, previousBlockHash: *}} - The complete block that was added to the blockchain
     */
	mine(){
        const lastBlock = this.getLastBlock();
        const previousBlockHash = lastBlock.hash;

        // currentBlockData can take anything you want to put in here
        const currentBlockData = {
            disasters: this.pendingDisasters,
            index: lastBlock.index + 1
        };
        const nonce = this.proofOfWork(previousBlockHash, currentBlockData);
        const blockHash = this.hashBlock(nonce, previousBlockHash, currentBlockData);
        return this.createNewBlock(nonce, previousBlockHash, blockHash);
	}
}


module.exports = DisasterBlockchain;
