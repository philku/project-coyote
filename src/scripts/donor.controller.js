const utils = require('./utils');

function _render(req,res,data={}) {
	console.log('^^^^ rendering donor');
	let params = {};
	params.template = 'donor';
	utils.render(req,res,params);
}


module.exports = {
	render: _render
}
