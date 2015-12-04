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
	var id, list = makeCharacterList(usernames, definedSpecialCharacters, numUsers);
	_.forEach(list, function (character) {
		id = ids[character['player']];
		io.sockets.connected[id].emit('defined character player list', character);
	});
};

var makeCharacterList = function(names, usedChars, num) {
	var numB = (num < 7) ? 2 :
						 (num < 10) ? 3 : 4;
	var numG = num - numB;

	_.forEach(usedChars, function (characters) {
		(characters['side'] === 'g') ? numG-- : numB--;
	});

	for(var i = 0; i < numB; i++)
		usedChars.push(chars.bChar[i]);
	for(var i = 0; i < numG; i++)
		usedChars.push(chars.gChar[i]);
	return assignPlayers(usedChars, names);
};

//randomly assigns each player to a character
var assignPlayers = function(characters, players) {
	var random, flag;
	characters = clearPlayers(characters);
	_.forEach(players, function (person) {
		flag = true;
		for(var i = 0; flag && i < 100; i++) { //i < 100 could be added in
			random = randomBetween(0, characters.length - 1);
			if(!characters[random]['player']) {
				characters[random]['player'] = person;
				flag = false;
			}
		}
	});
	return charactersKnowledge(characters);
};

//clears the players names from the character objects
var clearPlayers = function(characters) {
	_.forEach(characters, function (character) {
		character['player'] = null;
		character['know'] = null;
		character['know'] = [];
	});
	return characters;
};

//gives the characters their knowledge about other players
var charactersKnowledge = function(characters) {
	var merlin = [], percival = [], evil = [];
	_.forEach(characters, function (character) {
		(character.revealMerlin) ? merlin.push(character.player) : null;
		(character.revealPercival) ? percival.push(character.player) : null;
		(character.revealEvil) ? evil.push(character.player) : null;
	});

	_.forEach(characters, function (character) {
		character['know'] = (character['name'] === "Merlin") ? merlin :
												(character['name'] === 'Percival') ? percival :
												(character['side'] === 'e' && character['name'] !== 'Oberon') ? evil :
												null;
	});
//console.log(characters);
	return characters;
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
};

//gives a random number between min and max
function randomBetween(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}