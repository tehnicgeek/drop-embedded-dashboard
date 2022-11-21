//*********************************************************************************
//SERVER - LoRa Gateway
//*********************************************************************************
//Import the Modules Required
var bodyParser  = require('body-parser');
var express 	= require('express');
var request 	= require('request');
var path 		= require("path");
var session 	= require("express-session");
var logger      = require('./logger');
var app 		= express();

//Server set to the local server
var HTTP_HOST 	= process.env.HOST || '127.0.0.1';
//Port to listen to the client connections
var HTTP_PORT 	= process.env.PORT || 5009;

//To receive the JSON data
app.use(bodyParser.json({ type: 'application/*+json' }));
//To receive the URL Encoded data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/images')));

//Cookie Setup
app.use(session({ 
	secret: 'example',
		cookie:{
			maxAge:86400000
		},
		resave: false,
		saveUninitialized: true
}));

//Express js setup
app.set("view engine","ejs")
app.set('views', __dirname + '/views')
app.set('views', path.join(__dirname, 'views'));

//UI Route 
require('./routes/router.js')(app);

//Start Listening to the 
app.listen(HTTP_PORT);
logger.info("Lora Network Server running on host:port => "+HTTP_HOST+":"+HTTP_PORT);
