const utils = require('./utils');

function _render(req,res,data={}) {
	console.log('^^^^ rendering donations');
	let params = {};
	params.template = 'donation';
	utils.render(req,res,params);
}


module.exports = {
	render: _render
}
