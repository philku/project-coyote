const utils = require('./utils');

function _render(req,res,pageConfig={}) {
	console.log('^^^^ rendering donor');
	let params = {
        template: pageConfig.template || 'donor',
        pageTitle: pageConfig.pageTitle || '',
        data: pageConfig.data || {}
	};
	utils.render(req,res,params);
}

function donorDetail({ req, res, donorBlockchain }) {
    const donorID = req.params.donorID;

    let donorData = {};
    let found = false;
    let pageConfig = {};

    for(let x = donorBlockchain.chain.length-1;x>0; x--) {
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

    pageConfig.template = 'donorDetails';

    let data = {};
    if(found) {
        data = {donorData};
    } else {
        data = {donorData: {error: "Donor Not Found"}};
    }

    pageConfig.data = data;
    pageConfig.pageTitle = `${donorData.city}, ${donorData.country}`;
    _render(req,res,pageConfig);
}

function listDonors({ req, res, donorBlockchain }) {
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
    const pageConfig = {
        template: "donorList",
        pageTitle: "Current Donor List",
        data: { donors: donors}
    };
    _render(req,res,pageConfig);
} // end listDonors()

function newDonor({ req, res}) {

    const pageConfig = {
        template: "donorNew",
        pageTitle: "New Donor Form"
    };

    _render(req,res,pageConfig);
} // end newDonor()


module.exports = {
	render: _render,
    listDonors,
    donorDetail,
	newDonor
};
