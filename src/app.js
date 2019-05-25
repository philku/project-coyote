// App setup - this is for end-user interaction

// Node modules
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

// Server-side scripts
const utils = require('./scripts/utils');


const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'html');


// Set up static styles directory
app.use(express.static(path.join(__dirname,'assets')));

// register handlebars
app.engine('html', exphbs( {
	extname: '.html',
	defaultView: 'index',
	defaultLayout: 'main',
	layoutsDir: __dirname + '/views/layouts',
	partialsDir: __dirname + '/views/partials'
}));


// Other initializations
const index = require('./scripts/index.controller');
const disaster = require('./scripts/disaster.controller');
const donor = require('./scripts/donor.controller');
const supply = require('./scripts/supply.controller');
const errorPage = require('./scripts/errorPage.controller');

let params = {};


// init blockchain params
const DonorBlockchain = require('./blockchains/donor.blockchain');
const donorBlockchain = new DonorBlockchain();


// Routes

/**
 *
 * To Do:
 *	1) For each route, make a separate script in /scripts and call it so this file does not get huge
 *
 *
 *
 *
 **/

app.get('/', (req,res) => {
	index.render(req,res);
});


app.get('/donor', (req,res) => {
	donor.render(req,res);
});

app.get('/disaster', (req,res) => {
	disaster.render(req,res);
});

app.get('/supply', (req,res) => {
	supply.render(req,res);
});



////  Blockchain API calls

//***************** Donors ****************
app.get('/api/blockchain/donor/add', (req,res) => {
	// add donor to blockchain

	// Hardcoded for now
	donorObject = {
		email: "bdeemer@gmail.com",
		fname: "Bob",
		lname: "Deemer",
		organization: "Project Coyote"
	};

	donorBlockchain.addDonorToPendingDonors(donorBlockchain.createNewDonor(donorObject));
	res.send('donor added to pending queue<br><a href="/donor">DOnor Page</a><br>');
});

app.get('/api/blockchain/donor/mine', (req,res) => {
	const lastBlock = donorBlockchain.getLastBlock();
	const previousBlockHash = lastBlock.hash;

	// currentBlockData can take anything you want to put in here
	const currentBlockData = {
		donors: donorBlockchain.pendingDonors,
		index: lastBlock.index + 1
	};
	const nonce = donorBlockchain.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = donorBlockchain.hashBlock(nonce, previousBlockHash, currentBlockData);
	const newBlock = donorBlockchain.createNewBlock(nonce, previousBlockHash, blockHash);

	console.log('block should be mined: ', donorBlockchain.chain);
	console.log('donors in this block: ', newBlock);
	res.send('Donor block mined.<br><A href="/donor">Donor page</a><br>');

});


app.get('/api/blockchain/donor/list', (req,res) => {
	// use blockchain to list donors

});


app.get('/api/blockchain/donor/donations', (req,res) => {
	// list donations by a donor
});


app.get('*', (req,res) => {
	errorPage.render(req,res);
})

app.listen(3000, () => {console.log('Project Coyote listening on port 3000');});