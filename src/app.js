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

const DisasterBlockchain = require('./blockchains/disaster.blockchain');
const disasterBlockchain = new DisasterBlockchain();

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

	//console.log('block should be mined: ', donorBlockchain.chain);
	console.log('donors in this block: ', newBlock);
	res.send('Donor block mined.<br><A href="/donor">Donor page</a><br>');

});


app.get('/api/blockchain/donor/list', (req,res) => {
	// use blockchain to list donors
	let IDs = [];
	let donors = [];

	for(let x = donorBlockchain.chain.length-1;x>0;x--) {
		thisBlock = donorBlockchain.chain[x];
		thisBlock.donors.forEach((donor) => {
			if(IDs.indexOf(donor.donorID) === -1) {
				IDs.push(donor.donorID);
				donors.push(donor);
			}
		});
	}

	let output = "";
	donors.forEach((donor) => {
		output += `${donor.fname} ${donor.lname} (ID: ${donor.donorID})<br>`;
	});

	res.send(`<b>donor list:</b><br>${output}<br><br><a href="/donor">Main donor page</a>`);
	console.log('^^^^^ donor list: ', donors);

});

app.get('/api/blockchain/donor/details', (req,res) => {
	// just list the details of the first donor in the blockchain for skeleton
	let blockData = donorBlockchain.chain[1];
	let donor = blockData.donors[0];
	console.log('donor details path (only first donor in blockchain is display for proof of concept): ', donor);

	res.send(`Donor details: <br>fname: ${donor.fname}<br>last name: ${donor.lname}<br>org: ${donor.organization}<br>donor email: ${donor.email}<br>Donor ID: ${donor.donorID}<br><br><a href='/donor'>Donor home</a>`);

});

app.get('/api/blockchain/donor/donations', (req,res) => {
	// list donations by a donor - needs the disaster blockchain
});










/// Disaster endpoints
app.get('/api/blockchain/disaster/add', (req,res) => {
	const disaster = {
		latitude: "41N 17' 45\"",
		longitude: "103W 22' 55\"",
		city: "Nassau",
		state: null,
		country: "Bahamas",
		type: "Hurricane",
		description: "Category 5 hurricane."
	}

	disasterBlockchain.addDisasterToPendingDisasters(disasterBlockchain.createNewDisaster(disaster));
	res.send('DIsaster added to pending disasters<br><br><a href="/disaster">Disaster Home</a>');
});


app.get('/api/blockchain/disaster/mine', (req,res) => {
	const lastBlock = disasterBlockchain.getLastBlock();
	const previousBlockHash = lastBlock.hash;

	// currentBlockData can take anything you want to put in here
	const currentBlockData = {
		disasters: disasterBlockchain.pendingDisasters,
		index: lastBlock.index + 1
	};
	const nonce = disasterBlockchain.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = disasterBlockchain.hashBlock(nonce, previousBlockHash, currentBlockData);
	const newBlock = disasterBlockchain.createNewBlock(nonce, previousBlockHash, blockHash);

	//console.log('block should be mined: ', donorBlockchain.chain);
	console.log('disasters in this block: ', newBlock);
	res.send('Disaster block mined.<br><A href="/disaster">Disaster page</a><br>');

});


app.get('/api/blockchain/disaster/list', (req,res) => {
	// use blockchain to list donors
	let IDs = [];
	let disasters = [];

	for(let x = disasterBlockchain.chain.length-1;x>0;x--) {
		thisBlock = disasterBlockchain.chain[x];
		thisBlock.disasters.forEach((disaster) => {
			if(IDs.indexOf(disaster.disasterID) === -1) {
				IDs.push(disaster.disasterID);
				disasters.push(disaster);
			}
		});
	}

	let output = "";
	disasters.forEach((disaster) => {
		output += `type: ${disaster.type}<br> Lat: ${disaster.latitude}<br>Long: ${disaster.longitude}<br>city/state/country: ${disaster.city}, ${disaster.state}, ${disaster.country}<br>Notes: ${disaster.description}<br><br><br>`;
	});

	res.send(`<b>disaster list:</b><br>${output}<br><br><a href="/disaster">Main disaster page</a>`);
});



// 404 error page
app.get('*', (req,res) => {
	errorPage.render(req,res);
})

app.listen(3000, () => {console.log('Project Coyote listening on port 3000');});