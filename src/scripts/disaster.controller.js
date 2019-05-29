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
	console.log('pagedata: ', pageConfig);
	let params = {
		template: pageConfig.template || 'disaster',
		data: pageConfig.data || {}
	};
	console.log('pagedata/data: ', pageConfig.data);

	utils.render(req,res,params);
}

function disasterDetail({ req, res, disasterBlockchain }) {
	const disasterID = req.params.disasterID;

	let disasterData = {};
	let found = false;
	let pageConfig = {};

	for(let x = disasterBlockchain.chain.length-1;x>0; x--) {
		let thisBlock = disasterBlockchain.chain[x];
		thisBlock.disasters.forEach((disaster) => {
			if(disaster.disasterID === disasterID) {
				console.log('@@@@@@@@ located disaster: ', disaster);
				disasterData = disaster;
				found = true;
			}
		});
		if(found) {
			break;
		}
	}

	pageConfig.template = 'disasterDetails';
	if(found) {
		data = {disasterData};
	} else {
		data = {disasterData: {error: "Disaster Not Found"}};
	}

	pageConfig.data = data;
	_render(req,res,pageConfig);
}

function listDisasters({ req, res, disasterBlockchain }) {
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
	const pageConfig = {
		template: "disasterList",
		data: { disasters: disasters}
	};
	_render(req,res,pageConfig);
} // end listDisasters()

module.exports = {
	render: _render,
	listDisasters,
	disasterDetail
}
