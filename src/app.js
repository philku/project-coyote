// App
// Requires
const express = require('express');
const app = express();
const path = require('path');

// Parse Requests
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Log Requests
app.use((req,res,next)=>{
    console.log('==========================');
    console.log('______   Request   _______');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Body:', req.body);
    console.log('Params:', req.params);
    console.log('Query:', req.query);
    console.log('==========================');

	next();
});


// Server-side scripts
const utils = require('./scripts/utils');

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
const donation = require('./scripts/donation.controller');
const resource = require('./scripts/resource.controller');


// Authenticate any further requests
app.use((req,res,next)=>{
    console.log('Authenticate request here...');
    // TODO: Auth requests

    next();
});


// Routes

// General
app.get('/setup', (req,res) => {
    index.setupAll({ req, res, disasterBlockchain, donorBlockchain, resourceBlockchain, donationBlockchain});
    res.send('done');
});

// Disaster Details
app.get('/disaster', (req,res) => {
    disaster.disasterDetail(req,res,disasterBlockchain);
});
// List Disasters
app.get('/disasters', (req,res) => {
    disaster.listDisasters(req,res,disasterBlockchain);
});
// Add New Disaster
app.post('/disasters?/new', (req,res) => {
    disaster.newDisaster(req,res,disasterBlockchain);
});
// Mine Disaster Block
app.get('/disasters?/mine', (req,res) => {
    const newBlock = disasterBlockchain.mine();

    console.log('disasters in this block: ', newBlock);
    res.send('disasters in this block: ', newBlock);
});


// Donor Details
app.get('/donor', (req,res) => {
	donor.donorDetail(req,res,donorBlockchain);
});
// List Donors
app.get('/donors', (req,res) => {
    donor.listDonors(req,res,donorBlockchain);
});
// New Donor
app.post('/donors?/new', (req,res) => {
    donor.newDonor(req,res,donorBlockchain);
});
// Mine Donor Block
app.get('/donors?/mine', (req,res) => {
	const newBlock = donorBlockchain.mine();

	console.log('donors in this block: ', newBlock);
	res.send('donors in this block: ', newBlock);

});


// Resource Details
app.get('/resource', (req,res) => {
	resource.resourceDetail(req,res,resourceBlockchain);
});
// Resource Details
app.get('/resources', (req,res) => {
    resource.listResources(req,res,resourceBlockchain);
});
// New Resource
app.post('/resources?/new', (req,res) => {
    resource.newResource(req,res,resourceBlockchain);
});
// Mine Resource Block
app.get('/resources?/mine', (req,res) => {
    const newBlock = resourceBlockchain.mine();

    console.log('resources in this block: ', newBlock);
    res.send('resources in this block: ', newBlock);

});
// Mine Resource Block
app.get('/resources?/addInitial', (req,res) => {
    resource.addInitialResources(req,res,resourceBlockchain);
});


// Donation Details
app.get('/donation', (req,res) => {
    donation.donationDetail(req,res,donationBlockchain);
});
// List Donations
app.get('/donations', (req,res) => {
    donation.listDonations(req,res,donationBlockchain,resourceBlockchain,donorBlockchain,disasterBlockchain);
});
// New Donation
app.post('/donations?/new', (req,res) => {
    donation.newDonation(req,res,donationBlockchain);
});
// Mine Donation Block
app.get('/donations?/mine', (req,res) => {
    const newBlock = donationBlockchain.mine();

    console.log('donations in this block: ', newBlock);
    res.send('donations in this block: ', newBlock);

});


// Other
app.get('*', (req,res) => {
	res.status(404).send(Error('Invalid request'));
});
app.post('*', (req,res) => {
	res.status(404).send(Error('Invalid request'));
});



app.listen(3000, () => {console.log('Project Coyote listening on port 3000');});