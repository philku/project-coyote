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


// init various blockchains
const DonorBlockchain = require('./blockchains/donor.blockchain');
const donorBlockchain = new DonorBlockchain();

const DisasterBlockchain = require('./blockchains/disaster.blockchain');
const disasterBlockchain = new DisasterBlockchain();

const ResourceBlockchain = require('./blockchains/resource.blockchain');
const resourceBlockchain = new ResourceBlockchain();

const DonationBlockchain = require('./blockchains/donation.blockchain');
const donationBlockchain = new DonationBlockchain();


// Page controllers
const index = require('./scripts/index.controller');
const disaster = require('./scripts/disaster.controller');
const donor = require('./scripts/donor.controller');
const resource = require('./scripts/resource.controller');
const donation = require('./scripts/donation.controller');
const errorPage = require('./scripts/errorPage.controller');


// Other variables needed
let pageData = {}; // data that will be passed to the page to display


/******************* Index Page */
app.get('/', (req,res) => {
	index.render(req,res);
});

app.get('/setup', (req, res) => {
	index.setupAll({ req, res, disasterBlockchain, donorBlockchain, resourceBlockchain, donationBlockchain});
	res.send('All set.  A disaster, donot, 6 resource, and one donation has been initialized.<br><br><a href="/">Home</a>');
});


/////////// ALl routes here need set up in their respective controllers
/******************* Disaster Routes */
// get page
// Disaster Actions
app.get('/disaster', (req,res) => {
	disaster.render(req,res,{});
});
// List Disasters
app.get('/disasters?/list', (req,res) => {
	disaster.listDisasters({ req, res, disasterBlockchain });
});
// New Disaster Form
app.get('/disasters?/new', (req,res) => {
	disaster.newDisaster({ req, res});
});
// Disaster Details
app.get('/disasters?/detail/:disasterID', (req,res) => {
	disaster.disasterDetail({ req, res, disasterBlockchain });
});

/** Disaster Admin */
// add
app.get('/api/blockchain/disaster/add', (req,res) => {

    console.log("'/api/blockchain/disaster/add' received data: ", req.query);

    // Create the new Disaster object
    const newDisaster = disasterBlockchain.createNewDisaster({
        latitude: req.query.latitude,
        longitude: req.query.longitude,
        city: req.query.city,
        state: req.query.state,
        country: req.query.country,
        type: req.query.type,
        description: req.query.description
    });

    // Add the new Disaster to pending, then mine.
    disasterBlockchain.addDisasterToPendingDisasters(newDisaster);
    disasterBlockchain.mine();

    // Redirect user (w/ 303) to the disaster detail page of the newly created disaster.
    res.redirect(303, `/disaster/detail/${newDisaster.disasterID}`);
});

// mine - obsolete - mined automatically in the add function
app.get('/api/blockchain/disaster/mine', (req,res) => {
    const newBlock = disasterBlockchain.mine();

    //console.log('block should be mined: ', donorBlockchain.chain);
    console.log('disasters in this block: ', newBlock);
    res.send('Disaster block mined.<br><A href="/disaster">Disaster page</a><br>');
});



/******************* Donor Routes */
// get page
// Donor Actions
app.get('/donors?', (req,res) => {
	donor.render(req,res,pageData);
});
// List Donors
app.get('/donors?/list', (req,res) => {
    donor.listDonors({ req, res, donorBlockchain });
});
// New Donor form
app.get('/donors?/new', (req,res) => {
    donor.newDonor({ req, res});
});
// Donor Details
app.get('/donors?/detail/:donorID', (req,res) => {
    donor.donorDetail({ req, res, donorBlockchain });
});

/** Donor Admin */
// add
app.get('/api/blockchain/donor/add', (req,res) => {
	// add donor to blockchain

    console.log("'/api/blockchain/donor/add' received data: ", req.query);

    // Create the new Donor object
	const newDonor = donorBlockchain.createNewDonor({
        email: req.query.email,
        fname: req.query.fname,
        lname: req.query.lname,
        organization: req.query.organization
    });

	// Add the new donor to pending, then mine.
	donorBlockchain.addDonorToPendingDonors(newDonor);
    donorBlockchain.mine();

    // Redirect user (w/ 303) to the donor detail page of the newly created donor.
	res.redirect(303, `/donor/detail/${newDonor.donorID}`);
});

// mine - obsolete - mined automatically in the add function above
app.get('/api/blockchain/donor/mine', (req,res) => {
	const newBlock = donorBlockchain.mine();

	//console.log('block should be mined: ', donorBlockchain.chain);
	console.log('donors in this block: ', newBlock);
	res.send('Donor block mined.<br><A href="/donor">Donor page</a><br>');

});


/******************* Resource Routes */
// get page
app.get('/resource', (req,res) => {
	resource.render(req,res,pageData);
});

// list resouces
app.get('/resources?/list', (req,res) => {
	resource.listResources({ req, res, resourceBlockchain });
});


// add
app.get('/resource/addInitialResources', (req,res) => {
	resource.addInitialResources({ req, res, resourceBlockchain });
});

// mine - obsolete - mined automatically in the add function
app.get('/api/blockchain/resource/mine', (req,res) => {
	const newBlock = resourceBlockchain.mine();

	//console.log('block should be mined: ', donorBlockchain.chain);
	console.log('resources in this block: ', newBlock);
	res.send('Resource block mined.<br><A href="/resource">Resource page</a><br>');
});



/******************* Donation Routes */
// get page
app.get('/donation', (req,res) => {
	donation.render(req,res,pageData);
});

// add [TODO: change contents]
app.get('/donor/addDonation', (req,res) => {
	// get donor info from donor #1
	const donorBlockData = donorBlockchain.chain[1];
	const donor = donorBlockData.donors[0];

	// get disaster info from disaster #1
	const disasterBlockData = disasterBlockchain.chain[1];
	const disaster = disasterBlockData.disasters[0];


	const resources = [
		{
			UNNumber: "UN-WATER-001",
			Qty: 1000
		},

		{
			UNNumber: "UN-FOOD-001",
			Qty: 2000
		},
		{
			UNNumber: "UN-CLOTHING-001",
			Qty: 2500
		}
	];


	const donationObject = {
		dateTime: new Date(),
		disasterID: disaster.disasterID,
		donorID: donor.donorID,
		resources: resources,
		sendDate: null,
		arriveDate: null
	}

	donationBlockchain.addDonationToPendingDonations(donationBlockchain.createNewDonation(donationObject));
	donationBlockchain.mine();
	res.redirect(303, `/donations/list`);
});

// list
app.get('/donations?/list', (req,res) => {
	// list all donations
	const donationBlock = donationBlockchain.chain[1];
	const donations = donationBlock.donations;

	let output = "";

	donations.forEach((donation) =>{
		output += `(Disaster ID: ${donation.disasterID}<br>DOnor ID: ${donation.donorID}<br>Resources:<br>`;
		
		donation.resources.forEach((resource) => {
			output += `Quantity: ${resource.Qty} / UN Part number: ${resource.UNNumber}<br>`;
		});
		output += "<br><br>";
	});

	res.send(`<a href='/donation'>Donation Home</a><br><br>${output}`);
});

// List all donated resouces for a given disaster
app.get('/donations/list/:disasterID', (req,res) => {
	donation.listDonations({ req, res, disasterBlockchain, resourceBlockchain, donationBlockchain, donorBlockchain});
});

/******************* 404 error page */
app.get('*', (req,res) => {
	errorPage.render(req,res);
});



app.listen(3000, () => {console.log('Project Coyote listening on port 3000');});