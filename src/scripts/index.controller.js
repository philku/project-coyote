const utils = require('./utils');

function _render(req,res,pageConfig={}) {
	let params = {
		template: 'index',
		data: {}
	};
	utils.render(req,res,params);
}



module.exports = {
	render: _render
};