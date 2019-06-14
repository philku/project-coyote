const utils = require('./utils');

function _render(req,res,pageData={}) {
	console.log('^^^^ rendering donations');
	let pageConfig = {
		template: "donation",
		pageTile: "Donations"
	};
	utils.render(req,res,params);
}


function listDonations({ req, res, donationBlockchain, resouceBlockchain, donorBlockchain, disasterBlockchain }) {
	// get the disaster name
	let allDonations = [];

	disasterID = req.params.disasterID;
	disasterObject = disasterBlockchain.getDisasterData({disasterID});
	disasterInfo = disasterObject.disasterData;

	// get all donations for this disaster
	const donations = getDonationsForDisaster({disasterID, donationBlockchain});
	let donorObj = {};
	donations.forEach((donation) => {
		// get the donor name, resouce name + quantity
		donorID = donation.donorID;
		if(donorObj.donorID !== undefined) {
			let temp = {};
			let donorData = donationBlockchain.getDonorData({donorID: donation.donorID});
			temp.fname = donorData.fname;
			temp.lname = donorData.lname;
			temp.email = donorData.email;
			temp.org = donor.organization;
			donorObj.donorID = temp;
		}

		// need to pick up here in the AM.
	});


	// spit it all out


	const pageConfig = {
		template: "listDonations",
		pageTitle: "Donations for this disaster",
		data: { disasterInfo, allDonations }
	};

	utils.render(req, res, pageConfig);
} // end listDonations


// internal functions not exposed
/**
 * Returns an array of donation objects for a given disasterID
 *
 **/
function getDonationsForDisaster({disasterID, donationBlockchain}) {
	const chainLength = donationBlockchain.lenght;
	let donationArray = [];

	for(i=1;i<=chainLength;i++) {
		const thisBlock = donationBlockchain.chain[i];
		thisBlock.donations.forEach((donation) => {
			if(donation.disasterID === disasterID) {
				donationArray.push(donation);
			}
		});
	}
	return(donationArray);
}

module.exports = {
	render: _render,
	listDonations
}
