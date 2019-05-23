// App setup

// Node modules
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

// Server-side scripts
const utils = require('./scripts/utils');


const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'html');


// Set up static styles directory
app.use(express.static(path.join(__dirname,'assets')));

// register handlebars
app.engine('html', exphbs( {
	extname: '.html',
	defaultView: 'index',
	defaultLayout: 'main',
	layoutsDir: __dirname + '/views/layouts',
	partialsDir: __dirname + '/views/partials'
}));


// Other initializations
const index = require('./scripts/index.controller');
const disaster = require('./scripts/disaster.controller');
const donor = require('./scripts/donor.controller');
const supply = require('./scripts/supply.controller');
const errorPage = require('./scripts/errorPage.controller');

let params = {};


// init blockchain params


// Routes

/**
 *
 * To Do:
 *	1) For each route, make a separate script in /scripts and call it so this file does not get huge
 *
 *
 *
 *
 **/

app.get('/', (req,res) => {
	index.render(req,res);
});


app.get('/donor', (req,res) => {
	donor.render(req,res);
});

app.get('/disaster', (req,res) => {
	disaster.render(req,res);
});

app.get('/supply', (req,res) => {
	supply.render(req,res);
});


app.get('*', (req,res) => {
	errorPage.render(req,res);
})

app.listen(3000, () => {console.log('Project Coyote listening on port 3000');});