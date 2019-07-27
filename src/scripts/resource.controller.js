const utils = require('./utils');

function resourceDetail(req, res, resourceBlockchain) {
    const resourceID = req.query.resourceID;

    let resourceData = {};
    let found = false;

    for(let x = resourceBlockchain.chain.length - 1;x>0; x--) {
        let thisBlock = resourceBlockchain.chain[x];
        thisBlock.resources.forEach((resource) => {
            if(resource.resourceID === resourceID) {
                resourceData = resource;
                found = true;
            }
        });
        if(found) {
            break;
        }
    }

    let data = {};
    if(found) {
        data = {resourceData};
    } else {
        data = {resourceData: {error: "Resource Not Found"}};
    }

    res.send(data);
}

function listResources(req, res, resourceBlockchain) {
    let IDs = [];
    let resources = [];

    let thisBlock = {};
    for(let x = resourceBlockchain.chain.length-1;x>0;x--) {
        thisBlock = resourceBlockchain.chain[x];
        thisBlock.resources.forEach((resource) => {
            if(IDs.indexOf(resource.resourceID) === -1) {
                IDs.push(resource.resourceID);
                resources.push(resource);
            }
        });
    }

    res.send(resources);
} // end listResources()

function newResource(req, res, resourceBlockchain){

    // Hardcoded for now
    const resourceObject = {
        title: req.body.title,
        description: req.body.description,
        nsn: req.body.nsn,
        quantity: req.body.quantity,
        units: req.body.units,
        disasterID: req.body.disasterID
    };

    let newResourceObj = resourceBlockchain.createNewResource(resourceObject);
    resourceBlockchain.addResourceToPendingResources(newResourceObj);
    resourceBlockchain.mine();
    res.send(newResourceObj.resourceID);
} // end newResource()

function addMultipleResources(req,res,resourceBlockchain){
    let resources = req.body.resources;
    let resourceLength = resources.length;

    resources.forEach(resource => {
        resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource({
            disasterID: resource.disasterID,
            title: resource.title,
            description: resource.description,
            nsn: resource.nsn,
            quantity: resource.quantity,
            units: resource.units
        }));
        resourceLength--;
        if(resourceLength === 0){
            res.send(resourceBlockchain.mine());
        }
    });
}

function addInitialResources(req, res, resourceBlockchain) {
    const resourceObject = {
        title: "Bottled Water",
        description: "16.9oz bottle of water",
        nsn: "UN-WATER-001"
    };

    resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

    resourceObject.title = "Non Perishable Food";
    resourceObject.description = "Any canned or non-perishable food item";
    resourceObject.nsn = "UN-FOOD-001";
    resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

    resourceObject.title = "Clothing";
    resourceObject.description = "Gently used clothing";
    resourceObject.nsn = "UN-CLOTHING-001";
    resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

    resourceObject.title = "Shoes";
    resourceObject.description = "Mens / Womens / Childrens shoes";
    resourceObject.nsn = "UN-CLOTHING-002";
    resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

    resourceObject.title = "Ibuprofen";
    resourceObject.description = "200 Ibuprofen tablets";
    resourceObject.nsn = "UN-MEDS-001";
    resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

    resourceObject.title = "Bandages";
    resourceObject.description = "Any bandages and size with adhesive";
    resourceObject.nsn = "UN-MEDS-002";
    resourceBlockchain.addResourceToPendingResources(resourceBlockchain.createNewResource(resourceObject));

    resourceBlockchain.mine();

    res.send('done');
} // end addInitialResources()

module.exports = {
    listResources,
    resourceDetail,
	newResource,
    addInitialResources,
    addMultipleResources
};
