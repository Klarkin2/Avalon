var more = require('./helperFunctions.js'),
		chars = require('./chars.js'),
		characters = chars.specialChar;

exports.socketConnect = function (io) {
	io.on('connection', function (socket) {

		// Execute this when a user gets added to the game
		socket.on('add user', function (userObj) {
			var username = userObj['username'];
			var obj = userObj['state'];
			if(username in userStates) {
				more.updateUserSocket(socket, username);
				more.userRefresh(io, username, obj);
				socket.emit('define card flags', {rosterFlag: false});
			} else {
				more.addUserGetInfo(socket, username);
				socket.emit('define card flags', {cardFlip: false, rosterFlag: false});
				socket.emit('first connected or waiting', usernames[0]);
	    	if(totalNumOfPlayers == numUsers && numPlayersDefined && specialCharsDefined)
	    		more.sendClientIdentity(io);
	    }
		});

		// Fulfills the clients request for list of all special characters
		socket.on('request all special characters', function () {
			socket.emit('all special characters list', characters)
		});

		// Sets the variable of how many players there will be
		socket.on('define number of players this game', function (num) {
			totalNumOfPlayers = num; //assign to global variable
			numPlayersDefined = true;
			if(totalNumOfPlayers == numUsers && numPlayersDefined && specialCharsDefined)
	    	more.sendClientIdentity(io);
		});

		// Sets the special characters that will be used in this game
		socket.on('special characters to be used in the game', function (chars) {
			definedSpecialCharacters = chars; //assign to global variable
			specialCharsDefined = true;
			if(totalNumOfPlayers == numUsers && numPlayersDefined && specialCharsDefined)
	    	more.sendClientIdentity(io);
		});


		// More sockets here


		socket.on('test', function (value) {
			console.log(value);
		});

	});
};