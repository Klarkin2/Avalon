$(function() {
	// Initialize variables
	var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

	var $window = $(window);
	var $usernameInput = $('.usernameInput');
	var $numPeopleInput = $('.numPeopleInput');
	var $charSelectList = $('.charSelectList');
	var $cardArea = $('.card');
	var $nameReveal = $('.nameReveal');

	var $loginPage = $('.login.page');
	var $numPeoplePage = $('.numPeople.page');
	var $charSelectPage = $('.charSelect.page');
	var $waitingPage = $('.waiting.page');
	var $revealPage = $('.reveal.page');
	var $rosterPage = $('.roster.page');
	var $passFailPage = $('.passFail.page');
	var $statsPage = $('.stats.page');

	var charList, numUsers, firstConnected = false;
	var cardFlip = false, rosterFlag = false, charDisplay = true;
	var $currentInput = $usernameInput.focus();

	$.cookie.json = true;
	var socket = io();

	//prompt setting for username
	var numOfUsers, username = ($.cookie('username')) ? userHasCookie() : null;
	defineSpecialCharacterList();

	//if the user has a cookie, assign username variable and move to next page
	function userHasCookie() {
		socket.emit('add user', $.cookie('username')['username']);
		return $.cookie('username')['username'];
	};

	//creates a cookie of a list of all special characters
	function defineSpecialCharacterList() {
		if($.cookie('special characters list'))
			charList = $.cookie('special characters list');
		else
			socket.emit('request all special characters');
	};

	//sets the username for that socket
	function setUsername() {
		username = cleanInput($usernameInput.val().trim());
		socket.emit('add user', username);
		$.cookie('username', {username: username});
	};

	//takes users to the lobby
	function lobby() {
		socket.emit('user state update', {username: username, object: {state: 'waiting'}});
		$usernameInput.blur(); //hides the keyboard on the waiting page/lobby
		pulsateWaitingText();
		$waitingPage.show();
		$loginPage.off('click');
	};

	//defines the number of players
	function numPlayersPage() {
		socket.emit('user state update', {username: username, object: {state: 'numPeople'}});
		firstConnected = true;
		$numPeoplePage.show();
		$loginPage.off('click');
		$currentInput = $numPeopleInput.focus();
	};

	//defines the special characters
	function setSpecialChars(reconnect) {
		var $charBox, $characterArray, $submit, $charName;
		numOfUsers = cleanInput($numPeopleInput.val().trim());
		$numPeopleInput.blur(); //hides the keyboard on the special character page

		socket.emit('define number of players this game', numOfUsers);
		socket.emit('user state update', {username: username, object: {state: 'charSelect'}});
		$numPeoplePage.fadeOut();
		$charSelectPage.show();
		$numPeoplePage.off('click');	

		if(charDisplay) { //this is a trigger that prevents multiple sets of character lists from being generated
			for(var i = 0; i < charList.length; i++) { //displays the characters that can be selected
				$charBox = $('<input type="checkbox" name = "checkboxes" id="' + charList[i].name + '" value="' + charList[i].name + '">');
				$charName = $('<label>' + charList[i].name + '</label>');
				$characterArray = $('<li class="characterArray"/>')
					.data('name', charList[i].name)
					.append($charBox, $charName);
				$charSelectList
				.css('top', '5%')
				.hCenter()
				.append($characterArray);
			}
			$submit = $('<a href="#" class="submitButton">Submit</a>')
				.on('click', function() {
					var $specialChars = $('input[name=checkboxes]:checked');
					var list = [];
					$specialChars.each(function (name) {
						$.grep(charList, function (character) {
							if(character.name == $specialChars[name].id)
								list.push(character);
						});
					});

					socket.emit('special characters to be used in the game', list);
					socket.emit('user state update', {username: username, object: {state: 'waiting'}});

					$charSelectPage.fadeOut();
					$usernameInput.blur(); //hides the keyboard on the waiting page/lobby
					pulsateWaitingText();
					$waitingPage.show();
					$charSelectPage.off('click');
				});
			$charSelectList.append($submit);
			charDisplay = false;
		}
		(reconnect) ? socket.emit('send existing identities') : null;
	};

	//projects each user their own character
	function projectCharacter(charObj) {
		var $revealName, width, $name = null, names = null;
		socket.emit('user state update', {username: username, object: {state: 'reveal', character: charObj}});
		$waitingPage.fadeOut();
		$revealPage.show();
		$waitingPage.off('click');
		$nameReveal.lowCenter('100%'); //gets the ul out of the way, until the card is flipped

		$('[name="backSide"]').attr("src", "/images/" + charObj['filename']);
		$('#card').flip({speed: 200, trigger: 'click'});
		$('.frontCard').on('click', function() {
			$('#card').flip(false);
			if(!cardFlip) {
				socket.emit('user state update', {username: username, object: {cardFlipped: true}});
				names = (charObj['know']) ? charObj['know'] : "";
				for(var i = 0; i < names.length; i++) {
					$name = $('<label class="namesIKnow">' + names[i] + '</label>');
					$revealName = $('<li class="namesIKnow"/>')
						.append($name);
					$nameReveal
					.lowCenter($('.cards').getRecommendedHeight(3))
					.append($revealName);
				}
				cardFlip = true;
			}
		});
		$('.backCard').on('click', function() {
			$('#card').flip(true);
			if(!rosterFlag) {
				$nameReveal.css('display', 'none');
				addRosterAndCards();
				rosterFlag = true;
			}
		});

		//adds the 'pick roster' button and the voting cards to the bottom of the screen
		function addRosterAndCards() {
			var $pickRoster = $('<a href="#" class="rosterButton">Select Roster</a>')
				.lowCenter($('.cards').getRecommendedHeight(3))
				.on('click', function() {
			});
			$revealPage.append($pickRoster);
		};

	};

/*******************************************************************
**************************Socket Events*****************************
*******************************************************************/
	socket.on('reset', function (bool) {
		numUsers = null, firstConnected = false;
		username = null, numOfUsers = null;
		$currentInput = $usernameInput.focus();
		showPage('login');
		$('#card').flip(false);
		$nameReveal.css('display', "list-item");
		$('.frontCard').off();
		$('.backCard').off();
		cardFlip = false;
		rosterFlag = false;
		$('.namesIKnow').remove();
		$('.rosterButton').remove();
	});

	socket.on('all special characters list', function (list) {
		$.cookie('special characters list', list);
		charList = list;
	});

	socket.on('current number of users', function (num) {
		numUsers = num;
	});

	socket.on('defined character player list', function (list) {
		projectCharacter(list);
	});

	socket.on('first connected or waiting', function (firstUsername) {
		(firstUsername === username) ? numPlayersPage() : lobby();
	});

	// socket.on('reconnect', function (state) {
	// 	var page = null;
	// 	cardFlip = state['cardFlipped'];
	// 	rosterFlag = !state['cardFlipped'];
	// 	page = state['state'];
	// 	pulsateWaitingText();
	// 	showPage('waiting');
	// 	setTimeout(function() {
	// 		showPage(state['state']);
	// 		(page === 'numPeople') ? numPlayersPage() :
	// 		(page === 'charSelect') ? setSpecialChars(true) :
	// 		(page === 'reveal') ? projectCharacter(state['character']) : null;
	// 	}, 750);
	// });

	/*******************************************************************
	***********************Random Functions*****************************
	*******************************************************************/

	// Prevents input from having injected markup
	function cleanInput (input) {
	  return $('<div/>').text(input).text();
	}

	//centers elements higher up on the screen
	jQuery.fn.hCenter = function () {
	  this.css("position","absolute");
	  this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
	  return this;
	}

	//centers elements lower on the screen. Let the user define how low.
	jQuery.fn.lowCenter = function (low) {
		low = (low) ? low : '80%';
		this.css({
			'position': 'absolute',
			'top': low,
			'left': '25%'
		});
		return this;
	}

	//gets recommended percentage for name reveals and 'pick roster' button
	jQuery.fn.getRecommendedHeight = function(addedHeight) {
		imgHeight = this.height();
		windowHeight = $(window).height();
		var percent = Math.ceil(((imgHeight/windowHeight)*100) + addedHeight).toFixed(1) + "%";
		return percent;
	}

	function pageFormat (array) {
		var string = "";
		for(var i = 0; i < array.length; i++) {
			string += array[i] + "\n";
		}
		return string;
	};

	//Pulsate waiting text
	function pulsateWaitingText () {
		var p = $(".waitingText");
		  for(var i=0; i<30; i++) {
		    p.animate({opacity: 0.2}, 1000, 'linear')
		     .animate({opacity: 1}, 1000, 'linear');
		  }
	};

	//shows only the defined page
	function showPage (page) {
		var pageNames = ['login', 'numPeople', 'charSelect', 'waiting', 'reveal', 'roster', 'passFail', 'stats'];
		var pageElements = $.makeArray($('.page'));
		var i = pageNames.indexOf(page);
		$(pageElements).each(function (index, element) {
			if(index !== i) {
				$(element).fadeOut();
				$(element).off('click');
			}
			else
				$(element).show();
		});
	};

	//removes element from array
	Array.prototype.remove = function(from, to) {
	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);
	};

	// Focus input when clicking anywhere on login page
	$loginPage.click(function () {
	  $currentInput.focus();
	});

	// Focus input when clicking anywhere on login page
	$numPeoplePage.click(function () {
	  $currentInput.focus();
	});

	/*******************************************************************
	******************Keyboard And Browser Events***********************
	*******************************************************************/

	// When the user hits 'enter'
	$window.keydown(function (event) {
		// Auto-focus the current input when a key is typed
	  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
	    $currentInput.focus();
	  }
	  // When the client hits Enter on their keyboard
	  if(event.which === 13) {
	  	if(!username)
	  		setUsername();
	  	else if(!numOfUsers && firstConnected)
				setSpecialChars();
		}
	});

});