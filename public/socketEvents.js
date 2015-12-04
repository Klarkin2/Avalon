var more = require('./helperFunctions.js'),
		chars = require('./chars.js'),
		characters = chars.specialChar;

var numPlayersDefined = false, specialCharsDefined = false;

exports.socketConnect = function (io) {
	io.on('connection', function (socket) {

		// SOCKET EMITS--------------------------

		//send the current number of connected users
		socket.emit('current number of users', numUsers);

		// ON SOCKET EVENTS----------------------

		//execute this when a user gets added to the game
		socket.on('add user', function (username) {
			more.addUserGetInfo(socket, username);
			(numUsers === 1) ? socket.emit('all special characters list', characters) : null;
			socket.emit('first connected or waiting', usernames[0]);
	    if(totalNumOfPlayers == numUsers && numPlayersDefined && specialCharsDefined)
	    	more.sendClientIdentity(io);
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


		//more sockets here


		socket.on('test', function (value) {
			console.log(value);
		});

	});
	io.on('disconnect', function () {
		
	});
};