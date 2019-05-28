const utils = require('./utils');

function _render(req,res,data={}) {
	let params = {
		template: 'index',
		data: data
	};
	utils.render(req,res,params);
}



module.exports = {
	render: _render
};