var os = require('os'),
		_ = require('lodash'),
		prompt = require('prompt');

var chars = require('./chars.js');

// Add the user to the game, get info about the users socket connection
exports.addUserGetInfo = function (socket, username) {
	socket.username = username; // Store the username in the socket session for this client
	ids[username] = socket.id; // Store the id as well
	userStates[username] = {state: "login", character: null, cardFlipped: false};
	usernames.push(username); // Add client username to global list
	++numUsers; // You could probably guess what this does...
};

// Updates the users socket connection on reconnect
exports.updateUserSocket = function (socket, username) {
	ids[username] = socket.id;
};

// Assign character identities and send each client their character object
exports.sendClientIdentity = function(io) {
	var id, assignedPlayerList = makeCharacterList(usernames, definedSpecialCharacters, numUsers);
	_.forEach(assignedPlayerList, function (character) {
		id = ids[character['player']];
		io.sockets.connected[id].emit('defined character player list', character);
		userStates[character['player']] = {state: "reveal", character: character, cardFlipped: false};
	});
};

// Handler for when user refreshes his page
exports.userRefresh = function (io, username, obj) {
	var id = ids[username], page = obj['state'];
	(page === 'login') ? io.sockets.connected[id].emit('show page', page) :
	(page === 'numPeople' || page === 'charSelect' || page === 'waiting') ? io.sockets.connected[id].emit('first connected or waiting', usernames[0]) :
	(page === 'reveal') ? io.sockets.connected[id].emit('defined character player list', obj['character']) :
	console.log(obj['state']);
};

// Auto generates a list of good/evil characters based on special characters defined and number of users
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

// Randomly assigns each player to a character
var assignPlayers = function(characters, players) {
	var random, flag;
	characters = clearPlayers(characters);
	_.forEach(players, function (person) {
		flag = true;
		for(var i = 0; flag && i < 100; i++) { // i < 100 could be added in
			random = randomBetween(0, characters.length - 1);
			if(!characters[random]['player']) {
				characters[random]['player'] = person;
				flag = false;
			}
		}
	});
	return charactersKnowledge(characters);
};

// Clears the players names from the character objects
var clearPlayers = function(characters) {
	_.forEach(characters, function (character) {
		character['player'] = null;
		character['know'] = null;
		character['know'] = [];
	});
	return characters;
};

// Gives the characters their knowledge about other players
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
	return characters;
};

// If the client wants to reset
exports.getPrompt = function(server, io) {
	var command, properties = {name: "cmd", description: "Enter Command (Exit, Reset, Clear Cookies)", required: true};
	prompt.start();
	function ask() {
		prompt.get(properties, function (err, result) {
			if(err) console.log(err);
			command = result['cmd'].toLowerCase().charAt(0);
			if(command === 'r') { // r == reset
				resetGame(io);
				ask();
			}
			else if(command === 'c') { // c == clear cookies
				// Logic to clear cookies from clients
			}
			else if(command === 'e') { // e == exit
				server.close();
				process.exit();
			}
			else
				ask();
		});
	};
	ask();
};

// Resets the game (number of players, defined special characters, and identities)
var resetGame = function(io) {
	numPlayersDefined = false, specialCharsDefined = false;
	totalNumOfPlayers = 0, definedSpecialCharacters = [], assignedPlayerList = [];
	usernames = [], userStates = {}, ids = {},	numUsers = 0;
	io.sockets.emit('reset');
	console.log("\x1b[36mReset Successful\x1b[0m");
};

// Gets the ip address where this server will be accessible
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

// Gives a random number between min and max
function randomBetween(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}