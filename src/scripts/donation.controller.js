const utils = require('./utils');

function donationDetail(req, res, donationBlockchain) {
    const donationID = req.params.donationID;

    let donationData = {};
    let found = false;

    for(let x = donationBlockchain.chain.length - 1;x>0; x--) {
        let thisBlock = donationBlockchain.chain[x];
        thisBlock.donations.forEach((donation) => {
            if(donation.donationID === donationID) {
                donationData = donation;
                found = true;
            }
        });
        if(found) {
            break;
        }
    }

    let data = {};
    if(found) {
        data = {donationData};
    } else {
        data = {donationData: {error: "Donation Not Found"}};
    }

    res.send(data);
}

/*function listDonations(req, res, donationBlockchain) {
    let IDs = [];
    let donations = [];

    let thisBlock = {};
    for(let x = donationBlockchain.chain.length-1;x>0;x--) {
        thisBlock = donationBlockchain.chain[x];
        thisBlock.donations.forEach((donation) => {
            if(IDs.indexOf(donation.donationID) === -1) {
                IDs.push(donation.donationID);
                donations.push(donation);
            }
        });
    }

    res.send(donations);
} // end listDonations()*/

function newDonation(req, res, donationBlockchain){

    // TODO: Donation Object

/*    const donationObject = {
        name: req.body.name,
        description: req.body.description,
        nsn: req.body.nsn,
        quantity: req.body.quantity
    };*/

    let newDonationObj = donationBlockchain.createNewDonation(donationObject);
    donationBlockchain.addDonationToPendingDonations(newDonationObj);
    donationBlockchain.mine();
    res.send(newDonationObj.donationID);
} // end newDonation()

function listDonations( req, res, donationBlockchain, resourceBlockchain, donorBlockchain, disasterBlockchain) {
    // get the disaster name
    let allDonations = [];

    let disasterID = req.query.disasterID;
    let disasterObject = disasterBlockchain.getDisasterData({disasterID});
    let disasterInfo = disasterObject.disasterData;

    // get all donations for this disaster
    const donations = getDonationsForDisaster({disasterID, donationBlockchain});
    donations.forEach((donation) => {
        let donorID = donation.donorID;

        // get the donor name, resouce name + quantity
        let tempDonorObj = {
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
            let theResource = resourceBlockchain.getResourceDataByNumber('nsn',resource.nsn);
            theResource.quantity = resource.quantity;
            tempDonorObj.resources.push(theResource);
        });

        allDonations.push(tempDonorObj);
    });

/*
    // spit it all out
    const pageConfig = {
        template: "listDonations",
        pageTitle: "Donations for this disaster",
        data: { disasterInfo, allDonations }
    };

    utils.render(req, res, pageConfig);*/

	let responseObj = {};
	responseObj.disasterInfo = disasterInfo;
	responseObj.allDonations = allDonations;

	res.send(responseObj);
} // end listDonations

function getDonationsForDisaster(disasterID, donationBlockchain) {
    console.log(`getDonationsForDisaster(${disasterID},${donationBlockchain})`);
	// Returns an array of donation objects for a given disasterID
    const chainLength = donationBlockchain.chain.length;
    let donationArray = [];

    for(let i=1;i<chainLength;i++) {
        const thisBlock = donationBlockchain.chain[i];
        thisBlock.donations.forEach((donation) => {
            console.log(donation);
            if(donation.disasterID === disasterID) {
                donationArray.push(donation);
            }
        });
    }

    console.log('donationArray: ', donationArray);
    return(donationArray);
}

module.exports = {
    listDonations,
    donationDetail,
    newDonation,
    getDonationsForDisaster
};
