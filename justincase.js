var os = require('os'),
		_ = require('lodash'),
		prompt = require('prompt');

var more = require('./helperFunctions.js'),
		chars = require('./chars.js'),
		characters = chars.specialChar;

//add the user to the game, get info about the users socket connection
exports.addUserGetInfo = function (socket, username) {
	socket.username = username; //store the username in the socket session for this client
	ids[username] = socket.id; //store the id as well
	usernames.push(username); //add client username to global list
	++numUsers; //you could probably guess what this does...
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
exports.getPrompt = function(server, io) {
	var command, properties = {name: "cmd", description: "Enter Command (Reset, Exit)", required: true};
	prompt.start();
	function ask() {
		prompt.get(properties, function (err, result) {
			if(err) console.log(err);
			command = result['cmd'].toLowerCase().charAt(0);
			if(command === 'r') { //r == reset
				resetGame(io);
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
var resetGame = function(io) {
	totalNumOfPlayers = 0, definedSpecialCharacters = [];
	usernames = [], ids = {},	numUsers = 0;
	io.sockets.emit('reset');
	console.log("\x1b[36mReset Successful\x1b[0m");
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

//original card flip function
$('#card').on('flip:done', function() { //this gets called repeatedly...
socket.emit('test', cardFlip);
			if(cardFlip) {
				names = (charObj['know']) ? charObj['know'] : "";
				for(var i = 0; i < names.length; i++) {
					$name = $('<label class="namesIKnow">' + names[i] + '</label>');
					$revealName = $('<li class="namesIKnow"/>')
						.append($name);
					$nameReveal
					.lowCenter($('.cards').getRecommendedHeight(3))
					.append($revealName);
				}
				cardFlip = false;
			}
			else {
				$nameReveal.css('display', 'none');
				if(rosterFlag) {
					addRosterAndCards();
					rosterFlag = false;
				}
			}
		});