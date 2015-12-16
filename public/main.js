$(function() {
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

	var charList, totalNumUsers, firstConnected, audio1, audio2;
	var charDisplay = true;
	var $currentInput = $usernameInput.focus();

	var socket = io();
	$.cookie.json = true; // Enables objects (instead of strings) to be stored in cookies.
	defineStateCookie();
	var username = ($.cookie('username')) ? userHasCookie() : null;

	// Define the initial state cookie that will be used in case the user refreshes his page.
	function defineStateCookie(bool) {
		if(!$.cookie('user state') || bool)
			$.cookie('user state', {state: null, character: null, cardFlipped: null});
	};

	// If the user has a cookie, assign username variable and move to next page
	function userHasCookie() {
		socket.emit('add user', {username: $.cookie('username')['username'], state: $.cookie('user state')});
		return $.cookie('username')['username'];
	};

	// Sets the username for that socket
	function setUsername() {
		username = cleanInput($usernameInput.val().trim());
		socket.emit('add user', {username, state: $.cookie('user state')});
		$.cookie('username', {username: username});
	};

	// Takes users to the lobby
	function lobby() {
		updateUserState({state: 'waiting'});
		$usernameInput.blur(); // Hides the keyboard on the waiting page/lobby
		pulsateWaitingText();
		$waitingPage.show();
		$loginPage.off('click');
	};

	// Defines the number of players
	function numPlayersPage() {
		updateUserState({state: 'numPeople'});
		defineSpecialCharacterList();
		$numPeoplePage.show();
		$loginPage.off('click');
		$currentInput = $numPeopleInput.focus();
	};

	// Creates a cookie of a list of all special characters
	function defineSpecialCharacterList() {
		if($.cookie('special characters list'))
			charList = $.cookie('special characters list');
		else
			socket.emit('request all special characters');
	};

	// Defines the special characters
	function setSpecialChars() {
		var $charBox, $characterArray, $submit, $charName;
		totalNumUsers = cleanInput($numPeopleInput.val().trim());
		$numPeopleInput.blur(); //hides the keyboard on the special character page

		socket.emit('define number of players this game', totalNumUsers);
		updateUserState({state: 'charSelect'});
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

					updateUserState({state: 'waiting'});
					$charSelectPage.fadeOut();
					$usernameInput.blur(); //hides the keyboard on the waiting page/lobby
					pulsateWaitingText();
					$waitingPage.show();
					$charSelectPage.off('click');
				});
			$charSelectList.append($submit);
			charDisplay = false;
		}
	};

	// Projects each user their own character
	function projectCharacter(charObj) {
		var $revealName, width, $name = null, names = null;
		updateUserState({state: 'reveal', character: charObj});
		$waitingPage.fadeOut();
		$revealPage.show();
		$waitingPage.off('click');
		$nameReveal.lowCenter('100%'); //gets the ul out of the way, until the card is flipped

		$('[name="backSide"]').attr("src", "/images/" + charObj['filename']);
		$('#card').flip({speed: 200, trigger: 'click'});
		$('.frontCard').on('click', function() {
			audio1.play();
			$('#card').flip(false);
			if(!$.cookie('cardFlip')) {
				updateUserState({cardFlipped: true});
				names = (charObj['know']) ? charObj['know'] : "";
				for(var i = 0; i < names.length; i++) {
					$name = $('<label class="namesIKnow">' + names[i] + '</label>');
					$revealName = $('<li class="namesIKnow"/>')
						.append($name);
					$nameReveal
					.lowCenter($('.cards').getRecommendedHeight(3))
					.append($revealName);
				}
				$.cookie('cardFlip', true);
			}
		});
		$('.backCard').on('click', function() {
			audio2.play();
			$('#card').flip(true);
			if(!$.cookie('rosterFlag')) {
				$nameReveal.css('display', 'none');
				addRosterAndCards();
				$.cookie('rosterFlag', true);
			}
		});

		// Adds the 'pick roster' button and the voting cards to the bottom of the screen
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
	socket.on('reset', function (firstUsername) {
		defineStateCookie(true); // Reset the users state at the beginning of a new round
		$usernameInput.attr('value', username);
		$currentInput = $usernameInput.focus();
		showPage('login');
		$('.frontCard').off();
		$('.backCard').off();
		$.cookie('cardFlip', false);
		$.cookie('rosterFlag', false);
		$('.namesIKnow').remove();
		$('.rosterButton').remove();
		$('#card').flip(false);
		$nameReveal.css('display', "list-item");
		totalNumUsers = null, username = null;
	});

	socket.on('all special characters list', function (list) {
		$.cookie('special characters list', list);
		charList = list;
	});

	socket.on('defined character player list', function (list) {
		projectCharacter(list);
	});

	socket.on('first connected or waiting', function (firstUsername) {
		defineStateCookie(true); // Reset the users state at the beginning of a new round
		firstConnected = (firstUsername === username) ? true : false;
		(firstUsername === username) ? numPlayersPage() : lobby();
	});

	socket.on('show page', function (page) {
		showPage(page);
	});

	socket.on('define card flags', function (obj) {
		('cardFlip' in obj) ? $.cookie('cardFlip', obj['cardFlip']) : null;
		('rosterFlag' in obj) ? $.cookie('rosterFlag', obj['rosterFlag']) : null;
	});


	/*******************************************************************
	***********************Random Functions*****************************
	*******************************************************************/

	// Prevents input from having injected markup
	function cleanInput (input) {
	  return $('<div/>').text(input).text();
	}

	// Centers elements higher up on the screen
	jQuery.fn.hCenter = function () {
	  this.css("position","absolute");
	  this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
	  return this;
	}

	// Centers elements lower on the screen. Let the user define how low.
	jQuery.fn.lowCenter = function (low) {
		low = (low) ? low : '80%';
		this.css({
			'position': 'absolute',
			'top': low,
			'left': '25%'
		});
		return this;
	}

	// Gets recommended percentage for name reveals and 'pick roster' button
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

	// Pulsate waiting text
	function pulsateWaitingText () {
		var p = $(".waitingText");
		  for(var i=0; i<30; i++) {
		    p.animate({opacity: 0.2}, 1000, 'linear')
		     .animate({opacity: 1}, 1000, 'linear');
		  }
	};

	// Shows only the defined page
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

	// Updates the user state cookie
	function updateUserState (update) {
		var objAttr = ['state', 'character', 'cardFlipped'];
		var cookie = $.cookie('user state');
		for(var i = 0; i < objAttr.length; i++) {
			if(objAttr[i] in update)
				cookie[objAttr[i]] = update[objAttr[i]];
		}
		$.cookie('user state', cookie);
	};

	// Removes element from array
	Array.prototype.remove = function(from, to) {
	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);
	};

	// Setup for audio effects when flipping cards
	$(document).ready(function() {
    audio1 = document.createElement('audio');
    audio2 = document.createElement('audio');
    audio1.setAttribute('src', '/audio/Flip1.mp3');
    audio2.setAttribute('src', '/audio/Flip2.mp3');
    $.get();
    audio1.addEventListener('load', function() {
      audio1.play();
    });
    audio2.addEventListener('load', function() {
      audio2.play();
    });
  });

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
	  	else if(!totalNumUsers && firstConnected)
				setSpecialChars();
		}
	});

});