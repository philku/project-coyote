/**
 * @ToDo List:
 *
 * 1. Ability to mark a disaster as "over" (admin) and not display the disaster in this list
 * 2. Ability to list active and completed disasters separately
 *
 *
 *
 **/
const utils = require('./utils');

function _render(req,res,pageConfig={}) {
	let params = {
		template: pageConfig.template || 'disaster',
		pageTitle: pageConfig.pageTitle || '',
		data: pageConfig.data || {}
	};

	utils.render(req,res,params);
}

function disasterDetail(req, res, disasterBlockchain) {
	const disasterID = req.query.disasterID;

	let disasterData = {};
	let found = false;

	for(let x = disasterBlockchain.chain.length-1;x>0; x--) {
		let thisBlock = disasterBlockchain.chain[x];
		thisBlock.disasters.forEach((disaster) => {
			if(disaster.disasterID === disasterID) {
				disasterData = disaster;
				found = true;
			}
		});
		if(found) {
			break;
		}
	}

	let data = {};
	if(found) {
		data = {disasterData};
	} else {
		data = {disasterData: {error: "Disaster Not Found"}};
	}

    res.send(data);
}

function listDisasters(req, res, disasterBlockchain) {
	let IDs = [];
	let disasters = [];

    let thisBlock = {};
	for(let x = disasterBlockchain.chain.length-1;x>0;x--) {
		thisBlock = disasterBlockchain.chain[x];
		thisBlock.disasters.forEach((disaster) => {
			if(IDs.indexOf(disaster.disasterID) === -1) {
				IDs.push(disaster.disasterID);
				disasters.push(disaster);
			}
		});
	}

    res.send(disasters);
} // end listDisasters()

function newDisaster(req, res, disasterBlockchain) {

	// Returns 'org' if org, 'user' if user
	function ownerType(owner,creator){
		if(owner === creator){
			return 'user';
		}else{
			return 'org';
		}
	}

    const disaster = {
        type: req.body.type,
        owner: req.body.owner,
        ownerType: ownerType(req.body.owner, req.body.creator),
        creator: req.body.creator,
        description: req.body.description,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        recipientName: req.body.recipientName,
        recipientAddressLine1: req.body.recipientAddressLine1,
        recipientAddressLine2: req.body.recipientAddressLine2,
        recipientCity: req.body.recipientCity,
        recipientState: req.body.recipientState,
        recipientPostalCode: req.body.recipientPostalCode,
        recipientCountry: req.body.recipientCountry,
        isActive: req.body.isActive
    };

    let newDisasterObj = disasterBlockchain.createNewDisaster(disaster);
    disasterBlockchain.addDisasterToPendingDisasters(newDisasterObj);
    disasterBlockchain.mine();
    res.send(newDisasterObj.disasterID);
} // end newDisaster()

module.exports = {
	render: _render,
	listDisasters,
	disasterDetail,
    newDisaster
};
