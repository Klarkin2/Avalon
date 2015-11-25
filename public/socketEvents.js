var more = require('./helperFunctions.js'),
		chars = require('./chars.js'),
		characters = chars.specialChar;

exports.socketConnect = function (io) {
	io.on('connection', function (socket) {	
		var addedUser = false;

		// SOCKET EMITS--------------------------

		//send the current number of connected users
		socket.emit('current number of users', numUsers);

		//give the client the list of all characters
		(numUsers === 0) ? socket.emit('character list', characters) : null;

		// ON SOCKET EVENTS----------------------

		//execute this when a user gets added to the game
		socket.on('add user', function (username) {
			more.addUserGetInfo(socket, username, addedUser);
	    (totalNumOfPlayers == numUsers) ? more.sendClientIdentity(io) : null;
		});

		//sets the variable of how many players there will be
		socket.on('define num of people', function (num) {
			totalNumOfPlayers = num; //assign to global variable
			(totalNumOfPlayers == numUsers) ? more.sendClientIdentity(io) : null;
		});

		//sets the special characters that will be used in this game
		socket.on('define special chars', function (chars) {
			definedSpecialCharacters = chars; //assign to global variable
			(totalNumOfPlayers == numUsers) ? more.sendClientIdentity(io) : null;
		});

		//more sockets here

	});
};