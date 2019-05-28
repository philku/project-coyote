const utils = require('./utils');

function _render(req,res,pageData={}) {
	console.log('^^^^ rendering donations');
	let params = {
		template: 'donation',
		data: pageData
	};
	utils.render(req,res,params);
}


module.exports = {
	render: _render
}
