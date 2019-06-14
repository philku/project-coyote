const utils = require('./utils');

function _render(req,res,pageConfig={}) {
	let params = {
		template: 'index',
		data: {}
	};
	utils.render(req,res,params);
}

function setupAll({req, res, disasterBlockchain, donorBlockchain, resourceBlockchain, donationBlockchain}) {
	// add a disaster
    const newDisaster = disasterBlockchain.createNewDisaster({
        latitude: `41N 17' 45"`,
        longitude: `103W 22' 55"`,
        city: "Nassau",
        state: "Grand Bahama",
        country: "Bahamas",
        type: "Hurricane",
        description: "Category 5 hurricane"
    });

    disasterBlockchain.addDisasterToPendingDisasters(newDisaster);
    disasterBlockchain.mine();




	// add a donor
	const newDonor = donorBlockchain.createNewDonor({
        email: "bdeemer@gmail.com",
        fname: "Bob",
        lname: "Deemer",
        organization: "Project Coyote"
    });

	donorBlockchain.addDonorToPendingDonors(newDonor);
    donorBlockchain.mine();




	// add resources
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




	// add a donation
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

}

module.exports = {
	render: _render,
	setupAll
};
