const utils = require('./utils');

function _render(req,res,pageData={}) {
	let pageConfig = {
		template: "donation",
		pageTile: "Donations"
	};
	utils.render(req,res,params);
}


function listDonations({ req, res, donationBlockchain, resourceBlockchain, donorBlockchain, disasterBlockchain }) {
	// get the disaster name
	let allDonations = [];

	disasterID = req.params.disasterID;
	disasterObject = disasterBlockchain.getDisasterData({disasterID});
	disasterInfo = disasterObject.disasterData;

	// get all donations for this disaster
	const donations = getDonationsForDisaster({disasterID, donationBlockchain});
	donations.forEach((donation) => {
		donorID = donation.donorID;

		// get the donor name, resouce name + quantity
		tempDonorObj = {
			donorID: donorID,
			donorData: {},
			resources: []
		};

		if(donation.donorID !== undefined) {
			let donorData = donorBlockchain.getDonorData({donorID: donation.donorID});
			donorData = donorData.donorData;
			tempDonorObj.donorData.fname = donorData.fname;
			tempDonorObj.donorData.lname = donorData.lname;
			tempDonorObj.donorData.email = donorData.email;
			tempDonorObj.donorData.org = donorData.organization;
			tempDonorObj.donorData.donorID = donorID;
		}

		//get resource + quantity
		donation.resources.forEach((resource) => {
			let theResource = resourceBlockchain.getResourceDataByNumber( resource.UNNumber );
			theResource.quantity = resource.quantity;
			tempDonorObj.resources.push(theResource);
		});

		allDonations.push(tempDonorObj);
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
	const chainLength = donationBlockchain.chain.length;
	let donationArray = [];

	for(i=1;i<chainLength;i++) {
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
