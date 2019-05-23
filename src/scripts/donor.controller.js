const utils = require('./utils');

function _render(req,res) {
	console.log('^^^^ rendering donor');
	let params = {};
	params.template = 'donor';
	utils.render(req,res,params);
}


module.exports = {
	render: _render
}
