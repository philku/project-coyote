const utils = require('./utils');

function _render(req,res,pageData={}) {
	console.log('^^^^ rendering resource');
	let params = {
		template: 'resource',
		pageData: pageData
	};
	utils.render(req,res,params);
}


module.exports = {
	render: _render
}
