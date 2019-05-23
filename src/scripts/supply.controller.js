const utils = require('./utils');

function _render(req,res) {
	console.log('^^^^ rendering supply');
	let params = {};
	params.template = 'supply';
	utils.render(req,res,params);
}


module.exports = {
	render: _render
}
