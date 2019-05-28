const utils = require('./utils');

function _render(req,res,data={}) {
	let params = {};
	params.template = '404';
	utils.render(req,res,params);
}



module.exports = {
	render: _render
};