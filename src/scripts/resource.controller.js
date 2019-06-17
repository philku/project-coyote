const utils = require('./utils');

function _render(req,res,pageData={}) {
	let params = {
		template: 'resource',
		pageData: pageData
	};
	utils.render(req,res,params);
}

function listResources({ req, res, resourceBlockchain}) {
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
	resources.forEach((resource) => {
		output += `title: ${resource.title}<br> desc: ${resource.description}<br>UNNumber: ${resource.UNNumber}<br><br>`;
	});
	res.send(`<b>resource list::</b><br>${output}<br><br><a href="/resource">Main resource page</a>`);
}

function addInitialResources({ req, res, resourceBlockchain }) {
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

	resourceBlockchain.mine();

    // Redirect user (w/ 303) to the donor detail page of the newly created donor.
	res.redirect(303, `/resources/list`);
} // end addInitialResources()

module.exports = {
	render: _render,
	listResources,
	addInitialResources
}
