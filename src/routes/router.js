var bodyParser  			= 	require('body-parser');
var logger      			= 	require('../logger');
var crypto 					= 	require('crypto');
var session 				= 	require("express-session");

function inherits(base, extension)
{
	for (var property in base){
		try{
			extension[property] = base[property];
		}
		catch(warning){
			logger.log(warning)
		}
	}
};

module.exports = function (app) {
	
	function checkSignIn(req, res, next ){
		if(req.session.sessId){
			next();     //If session exists, proceed to page
		} else {
			var err = new Error("Not logged in!");
			res.redirect('/');
		}
	};

	app.use(bodyParser.json()); // support json encoded bodies
	app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

	app.get('/',function(req,res){
		res.redirect('/index.html')
	});


	app.get('/main',function(req,res){
		res.render('main')
	});

	app.get('/dashboard',function(req,res){
		res.render('dashboard')
	});

	app.get('/init',function(req,res){
		var data = {
			"Data":""
		};
		data["Data"] = "Init message received";
		logger.info(data);
		res.sendStatus(200);
	});

	app.get('/logout', function (request, response) {
		request.session.destroy(function(err){
			if(err){
				logger.log(err);
			}else{
				response.redirect('/');
			}
		});
	});
	


	app.post("/login", function (request, response) {
		response.set("Connection", "close");
		response.redirect('/dashboard');
	});
};

