const utils = require('./utils');

function _render(req,res,data={}) {
	console.log('^^^^ rendering resource');
	let params = {};
	params.template = 'resource';
	utils.render(req,res,params);
}


module.exports = {
	render: _render
}
