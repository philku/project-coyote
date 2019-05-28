const utils = require('./utils');

function _render(req,res,pageData={}) {
	console.log('^^^^ rendering disaster');
	let params = {
		template: 'disaster',
		pageData: pageData
	};
	utils.render(req,res,params);
}


module.exports = {
	render: _render
}
