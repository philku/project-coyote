const utils = require('./utils');

function _render(req,res) {
	console.log('^^^^ rendering disaster');
	let params = {};
	params.template = 'disaster';
	utils.render(req,res,params);
}


module.exports = {
	render: _render
}
