var os = require('os'),
		_ = require('lodash'),
		prompt = require('prompt');

var more = require('./helperFunctions.js'),
		chars = require('./chars.js'),
		characters = chars.specialChar;

var socket;

//add the user to the game, get info about the users socket connection
exports.addUserGetInfo = function (socketCon, username, addedUser) {
	socket = socketCon;
	socketCon.username = username; //store the username in the socket session for this client
	ids[username] = socketCon.id; //store the id as well
	usernames.push(username); //add client username to global list
	++numUsers; //you could probably guess what this does...
	addedUser = true;
};

//send each client their character object
exports.sendClientIdentity = function(io) {
	var id, list = chars.makeCharacterList(usernames, definedSpecialCharacters, numUsers);
	_.forEach(list, function (character) {
		id = ids[character['player']];
		io.sockets.connected[id].emit('defined character player list', character);
	});
};

//if the client wants to reset
exports.getPrompt = function(server) {
	var command, properties = {name: "cmd", description: "Enter Command (Reset, Exit)", required: true};
	prompt.start();
	function ask() {
		prompt.get(properties, function (err, result) {
			if(err) console.log(err);
			command = result['cmd'].toLowerCase().charAt(0);
			if(command === 'r') { //r == reset
				resetGame();
				ask();
			}
			else if(command === 'e') { //e == exit
				server.close();
				process.exit();
				console.log("Server Offline");
			}
		});
	};
	ask();
};

//resets the game (number of players, defined special characters, and identities)
var resetGame = function() {
	//socket.emit('reset', )
};

//gets the ip address where this server will be accessible
exports.getIP = function() {
	var interfaces = os.networkInterfaces(), addresses = [];
	for (var k in interfaces) {
	  for (var k2 in interfaces[k]) {
	    var address = interfaces[k][k2];
	    if (address.family === 'IPv4' && !address.internal) {
	        addresses.push(address.address);
	    }
	  }
	}
	return addresses;
}