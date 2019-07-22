const sha256 = require('sha256');
const currentNodeURL = process.argv[3];
const uuid = require('uuid/v1');

/**
 * DonorBlockchain Class
 */
class DonorBlockchain{
    constructor(){
        this.chain = [];
        this.pendingDonors = [];

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
     * @returns {{index: number, timestamp: number, donors: Array, nonce: *, hash: *, previousBlockHash: *}} - The complete block that was added to the blockchain
     */
    createNewBlock(nonce, previousBlockHash, hash) {
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
     * Returns the last block on this blockchain
     * @returns {object} - The last block that was added to the blockchain
     */
    getLastBlock(){
        return this.chain[this.chain.length-1];
    }

    /**
	 * creates a new donor object.
     * @param {string=} email
     * @param {string=} fname
     * @param {string=} lname
     * @param {string=} name
     * @param {string=} wallet_id
     * @param {string} type
     * @returns {{donorID: string, email: string, fname: string, lname: string, name: string, wallet_id: string, type: string}}
     */
    static createNewDonor({ email, fname, lname, name, wallet_id, type }) {
        return{
            donorID: uuid().split('-').join(''),
            email: email,
            fname: fname,
            lname: lname,
            name: name,
            wallet_id: wallet_id,
            type: type
        };
    }

    /**
     * Adds a donor to the pending donors array
     * @param {object} donorObj
     * @returns {number} - the index of the next block that will be mined.
     */
    addDonorToPendingDonors(donorObj) {
        this.pendingDonors.push(donorObj);
        // why does this return the id of the next block?
        return this.getLastBlock().index + 1;
    }

    /**
     * returns the hash of a block given the parameters
     * @param {number} nonce - The nonce to use for the block.
     * @param {string} previousBlockHash - the hash of the previous block in the blockchain
     * @param {object} currentBlockData - an object containing a donor object as creates in the createNewDonor method
     * @returns {string} - The sha256 of this data.
     */
    static hashBlock(nonce, previousBlockHash, currentBlockData){
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
    proofOfWork(previousBlockHash, currentBlockData){
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
    isChainValid(blockchain){
        let isValidChain = true;

        for(let i=1; i<blockchain.length;i++) {

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
    }

    /**
     * return a block with the given hash
     * @param {string} blockHash - The block hash to search for
     * @returns {object | null} - The block with the given hash.  null if the has is not found.
     */
    getBlock(blockHash){
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
	 * returns the information of a donor with a given donorID
     * @param {string} donorID - the ID of the donor
     * @returns {{donorData: {}}} - An object with the donor information.  Returns an empty object
     *					   			if the donor is not found.
     */
    getDonorData({ donorID }) {
        let donorData = {};
        let found = false;

        for (let x = this.chain.length - 1; x > 0; x--) {
            const theBlock = this.chain[x];
            theBlock.donors.forEach((donor) => {
                if (donorData.donorID === donorID) {
                    donorData = donor;
                    found = true;
                }
            });

            if (found) {
                break;
            }
        }

        return {
            donorData
        }
    }

    /**
	 * mines the next block
     * @returns {{index: number, timestamp: number, donors: Array, nonce: *, hash: *, previousBlockHash: *}}
     */
    mine(){
        const lastBlock = this.getLastBlock();
        const previousBlockHash = lastBlock.hash;

        // currentBlockData can take anything you want to put in here
        const currentBlockData = {
            donors: this.pendingDonors,
            index: lastBlock.index + 1
        };
        const nonce = this.proofOfWork(previousBlockHash, currentBlockData);
        const blockHash = this.hashBlock(nonce, previousBlockHash, currentBlockData);
        return this.createNewBlock(nonce, previousBlockHash, blockHash);
    }
}


module.exports = DonorBlockchain;
