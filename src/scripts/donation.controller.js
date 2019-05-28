const utils = require('./utils');

function _render(req,res,pageData={}) {
	console.log('^^^^ rendering donations');
	let params = {
		template: 'donation',
		pageData: pageData
	};
	utils.render(req,res,params);
}


module.exports = {
	render: _render
}
