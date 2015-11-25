var express = require('express'),
		app = express(),
		server = require('http').createServer(app),
		io = require('socket.io')(server),
		port = process.env.PORT || 8080;

var more = require('./public/helperFunctions.js'),
		sokt = require('./public/socketEvents.js');

var runServer = function() {
	//initiate global variables
	totalNumOfPlayers = 0, definedSpecialCharacters = [];
	usernames = [], ids = {},	numUsers = 0;

	//start listening to port
	server.listen(port, function() {
		console.log("Server is running: \x1b[36m" + more.getIP() + ":" + port + "\x1b[0m");
	});

	//route additional files properly
	app.use(express.static(__dirname + "/public"));

	//when a new client connects
	sokt.socketConnect();
};

runServer();