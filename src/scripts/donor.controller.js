const utils = require('./utils');

function donorDetail(req, res, donorBlockchain) {
    const donorID = req.query.donorID;

    let donorData = {};
    let found = false;

    for(let x = donorBlockchain.chain.length - 1;x>0; x--) {
        let thisBlock = donorBlockchain.chain[x];
        thisBlock.donors.forEach((donor) => {
            if(donor.donorID === donorID) {
                donorData = donor;
                found = true;
            }
        });
        if(found) {
            break;
        }
    }

    let data = {};
    if(found) {
        data = {donorData};
    } else {
        data = {donorData: {error: "Donor Not Found"}};
    }

    res.send(data);
}

function listDonors(req, res, donorBlockchain) {
    let IDs = [];
    let donors = [];

    let thisBlock = {};
    for(let x = donorBlockchain.chain.length-1;x>0;x--) {
        thisBlock = donorBlockchain.chain[x];
        thisBlock.donors.forEach((donor) => {
            if(IDs.indexOf(donor.donorID) === -1) {
                IDs.push(donor.donorID);
                donors.push(donor);
            }
        });
    }

    res.send(donors);
} // end listDonors()

function newDonor(req, res, donorBlockchain){

    // Hardcoded for now
    const donorObject = {
        email: req.body.email,
        fname: req.body.fname,
        lname: req.body.lname,
        organization: req.body.organization
    };

    let newDonorObj = donorBlockchain.createNewDonor(donorObject);
    donorBlockchain.addDonorToPendingDonors(newDonorObj);
    donorBlockchain.mine();
    res.send(newDonorObj.donorID);
} // end newDonor()


module.exports = {
    listDonors,
    donorDetail,
	newDonor
};
