/**
 * function _render - renders a page
 *
 *	@param {Object} req - The express request object
 *	@param {Object} res - The express response object
 *	@param {Object} params - The parameters used to display the template
 *	@param {string} params.template - the name of the view to render 
 *	// depricated? @param {Object} params.context - The context / variables to pass to handlebars
 *
 *	Context Metadata
 *	@params {string} params.context.pageTitle - The title of the page
 *
 *
 *
 **/
_render = (req, res, params={}) => {
	const context = params;
	context.pageTitle = getPageTitle(params.template);
	res.render(params.template,context);
} //end render()


/**
 * function getPageTitle - Returns the page title for given page
 *
 *	@param {string} template = The template being displayed.
 *
 *	@return {string} - Title of the page
 *
 **/
getPageTitle = template => {
	let pageTitles = {
		index: "Project Coyote",
		"404":  "Project Coyote - Page Not Found"
	}
	return pageTitles[template] || "Project Coyote";
} // end _getPageTitle


module.exports = {
	render: _render
}
