var more = require('./helperFunctions.js'),
		chars = require('./chars.js'),
		characters = chars.specialChar;

exports.socketConnect = function (io) {
	io.on('connection', function (socket) {

		// SOCKET EMITS--------------------------

		//send the current number of connected users
		socket.emit('current number of users', numUsers);

		// ON SOCKET EVENTS----------------------

		//execute this when a user gets added to the game
		socket.on('add user', function (username) {
			if(username in userStates) {
				socket.emit('reconnect', userStates[username]);
				more.updateUserSocket(socket, username);
			}
			else {
				more.addUserGetInfo(socket, username);
				socket.emit('first connected or waiting', usernames[0]);
	    	if(totalNumOfPlayers == numUsers && numPlayersDefined && specialCharsDefined)
	    		more.sendClientIdentity(io);
	    }
		});

		// fulfills the clients request for list of all special characters
		socket.on('request all special characters', function () {
			socket.emit('all special characters list', characters)
		});

		//sets the variable of how many players there will be
		socket.on('define number of players this game', function (num) {
			totalNumOfPlayers = num; //assign to global variable
			numPlayersDefined = true;
			if(totalNumOfPlayers == numUsers && numPlayersDefined && specialCharsDefined)
	    	more.sendClientIdentity(io);
		});

		//sets the special characters that will be used in this game
		socket.on('special characters to be used in the game', function (chars) {
			definedSpecialCharacters = chars; //assign to global variable
			specialCharsDefined = true;
			if(totalNumOfPlayers == numUsers && numPlayersDefined && specialCharsDefined)
	    	more.sendClientIdentity(io);
		});

		//updates the users state
		socket.on('user state update', function (state) {
			more.updateUserState(state['username'], state['object']);
		});

		socket.on('send existing identities', function () {
			more.sendExistingIdentity(io, definedSpecialCharacters);
		});


		//more sockets here


		socket.on('test', function (value) {
			console.log(value);
		});

	});
};