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

function newDonor({ req, res}) {

    const pageConfig = {
        template: "donorNew",
        pageTitle: "New Donor Form"
    };

    _render(req,res,pageConfig);
} // end newDonor()


module.exports = {
	render: _render,
	newDonor
};
