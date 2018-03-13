const express    	 = require('express');
const path 			 = require('path');
const http 			 = require('http');
const dev 			 = require('dotenv').config();

// express route
const app = express();

var { allUserError } = require('./utils/calculation/calculation.js');
var { readcsv } = require('./utils/movieClean/movieClean.js');
var { movierating } = require('./utils/movieClean/movieRating.js');
var { learning } = require('./utils/training/training.js');


app.get('*',function(req,res){
	allUserError();
})


/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));