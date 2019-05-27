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
const resource = require('./scripts/resource.controller');
const errorPage = require('./scripts/errorPage.controller');

let params = {};


// init blockchain params
const DonorBlockchain = require('./blockchains/donor.blockchain');
const donorBlockchain = new DonorBlockchain();

const DisasterBlockchain = require('./blockchains/disaster.blockchain');
const disasterBlockchain = new DisasterBlockchain();

const ResourceBlockchain = require('./blockchains/resource.blockchain');
const resourceBlockchain = new ResourceBlockchain();


// Routes

/**
 *
 * To Do:
 *	1) For each route, make a separate script in /scripts and call it so this file does not get huge
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

app.get('/resource', (req,res) => {
	resource.render(req,res);
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










///***************** Disaster endpoints
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



//************ resource endpoints

app.get('/api/blockchain/resource/add', (req,res) => {
	const resourceObject = {
		title: "Bottled Water",
		description: "16.9oz bottle of water",
		UNNumber: "UN-WATER-001"
	};

	resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

	resourceObject.title = "Non Perishable Food";
	resourceObject.description = "Any canned or non-perishable food item";
	resourceObject.UNNumber = "UN-FOOD-001";
	resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

	resourceObject.title = "Clothing";
	resourceObject.description = "Gently used clothing";
	resourceObject.UNNumber = "UN-CLOTHING-001";
	resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

	resourceObject.title = "Shoes";
	resourceObject.description = "Mens / Womens / Childrens shoes";
	resourceObject.UNNumber = "UN-CLOTHING-002";
	resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

	resourceObject.title = "Ibuprofen";
	resourceObject.description = "200 Ibuprofen tablets";
	resourceObject.UNNumber = "UN-MEDS-001";
	resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

	resourceObject.title = "Bandages";
	resourceObject.description = "Any bandages and size with adhesive";
	resourceObject.UNNumber = "UN-MEDS-002";
	resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

	res.send('Added 6 items to the pending resources queue.<br><a href="/resource">Resources main</a>');
});




// mine
app.get('/api/blockchain/resource/mine', (req,res) => {
	const lastBlock = resourceBlockchain.getLastBlock();
	const previousBlockHash = lastBlock.hash;

	// currentBlockData can take anything you want to put in here
	const currentBlockData = {
		resources: resourceBlockchain.pendingResources,
		index: lastBlock.index + 1
	};
	const nonce = resourceBlockchain.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = resourceBlockchain.hashBlock(nonce, previousBlockHash, currentBlockData);
	const newBlock = resourceBlockchain.createNewBlock(nonce, previousBlockHash, blockHash);

	//console.log('block should be mined: ', donorBlockchain.chain);
	console.log('resources in this block: ', newBlock);
	res.send('Resource block mined.<br><A href="/resource">Resource page</a><br>');

});

// list
app.get('/api/blockchain/resource/list', (req,res) => {
	// use blockchain to list resources
	let IDs = [];
	let resources = [];

	for(let x = resourceBlockchain.chain.length-1;x>0;x--) {
		thisBlock = resourceBlockchain.chain[x];
		thisBlock.resources.forEach((resource) => {
			if(IDs.indexOf(resource.resourceID) === -1) {
				IDs.push(resource.resourceID);
				resources.push(resource);
			}
		});
	}

	let output = "";
	console.log('resource array after looking: ', resources);
	resources.forEach((resource) => {
		output += `title: ${resource.title}<br> desc: ${resource.description}<br>UNNumber: ${resource.UNNumber}<br><br>`;
	});

	res.send(`<b>resource list:</b><br>${output}<br><br><a href="/resource">Main resource page</a>`);
});


// 404 error page
app.get('*', (req,res) => {
	errorPage.render(req,res);
})

app.listen(3000, () => {console.log('Project Coyote listening on port 3000');});