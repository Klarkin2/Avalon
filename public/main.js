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
	var $usernameInput = $('.usernameInput'); // Input for username
	var $numPeopleInput = $('.numPeopleInput'); //Input for the number
	var $charSelectList = $('.charSelectList');
	var $cardArea = $('.card');
	var $nameReveal = $('.nameReveal');

	var $loginPage = $('.login.page');
	var $numPeoplePage = $('.numPeople.page');
	var $charSelectPage = $('.charSelect.page');
	var $waitingPage = $('.waiting.page');
	var $charAndRevealPage = $('.charAndReveal.page');
	var $rosterPage = $('.roster.page');
	var $statsPage = $('.stats.page');

	var charList, numUsers;
	var $currentInput = $usernameInput.focus();

	//prompt setting for username
	var username, numOfUsers;
	var connected = false, sent = false;

	var socket = io();

	//sets the username for that socket
	function setUsername() {
		username = cleanInput($usernameInput.val().trim());

		//If the username is valid
		if (username) {
			$loginPage.fadeOut();
			if(numUsers === 0 && !sent) {
				$numPeoplePage.show();
				$loginPage.off('click');
				$currentInput = $numPeopleInput.focus();
				sent = true;
			}
			else {
				$waitingPage.show();
				$loginPage.off('click');
			}
			//Tell the server your username
			socket.emit('add user', username);
		}
	};

	//defines the number of users
	function setNumUsers() {
		numOfUsers = cleanInput($numPeopleInput.val().trim());

		socket.emit('define num of people', numOfUsers);
		$numPeoplePage.fadeOut();
		$charSelectPage.show();
		$numPeoplePage.off('click');	
	};

	//select special chars
	function selectChars() {
		var $charBox, $characterArray, $submit, $charName;
		$numPeopleInput.blur(); //hides the keyboard on the special character page
		for(var i = 0; i < charList.length; i++)
		{
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
				socket.emit('define special chars', list);

				$charSelectPage.fadeOut();
				$waitingPage.show();
				$charSelectPage.off('click');
			});
		$charSelectList.append($submit);
	};

	//projects each user their own character
	function projectCharacter(charObj) {
		var $revealName, $name, names, width, flag = true, flag2 = true;
		$waitingPage.fadeOut();
		$charAndRevealPage.show();
		$waitingPage.off('click');
		$nameReveal.lowCenter('72%')

		$('[name="backSide"]').attr("src", "/images/" + charObj['filename']);
		$('#card').flip({speed: 200});
		$('#card').on('flip:done', function() {
			if(flag) {
				names = (charObj['know']) ? charObj['know'] : "";
				for(var i = 0; i < names.length; i++) {
					$name = $('<label>' + names[i] + '</label>');
					$revealName = $('<li class="namesIKnow"/>')
						.append($name);
					$nameReveal.append($revealName);
				}
				flag = false;
			}
			else {
				$nameReveal.css('display', 'none');
				if(flag2) {
					addRosterAndCards();
					flag2 = false;
				}
			}
		});


		//adds the 'pick roster' button and the voting cards to the bottom of the screen
		function addRosterAndCards() {
			var $pickRoster = $('<a href="#" class="rosterButton">Select Roster</a>')
				.lowCenter('72%')
				.on('click', function() {
			});
			$charAndRevealPage.append($pickRoster);
		};

	};

/*******************************************************************
**************************Socket Events*****************************
*******************************************************************/

	socket.on('character list', function (list) {
		charList = list;
	});

	socket.on('current number of users', function (num) {
		numUsers = num;
	});

	socket.on('defined character player list', function (list) {
		projectCharacter(list);
	});


	/*******************************************************************
	***********************Random Functions*****************************
	*******************************************************************/

	// Prevents input from having injected markup
	function cleanInput (input) {
	  return $('<div/>').text(input).text();
	}

	jQuery.fn.hCenter = function () {
	  this.css("position","absolute");
	  // this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
	  //                                             $(window).scrollTop()) + "px");
	  this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
	                                              $(window).scrollLeft()) + "px");
	  return this;
	}
	jQuery.fn.lowCenter = function (low) {
		low = (low) ? low : '80%';
		this.css({
			'position': 'absolute',
			'top': low,
			'left': '25%'
		});
		return this;
	}

	function pageFormat (array) {
		var string = "";
		for(var i = 0; i < array.length; i++) {
			string += array[i] + "\n";
		}
		return string;
	};

	//Pulsate waiting text
	var p = $(".waitingText");
	  for(var i=0; i<30; i++) {
	    p.animate({opacity: 0.2}, 1000, 'linear')
	     .animate({opacity: 1}, 1000, 'linear');
	  }

	// Focus input when clicking anywhere on login page
	$loginPage.click(function () {
	  $currentInput.focus();
	});

	// Focus input when clicking anywhere on login page
	$numPeoplePage.click(function () {
	  $currentInput.focus();
	});

	/*******************************************************************
	************************Keyboard Events*****************************
	*******************************************************************/

	$window.keydown(function (event) {
		// Auto-focus the current input when a key is typed
	  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
	    $currentInput.focus();
	  }
	  //When the client hits Enter on their keyboard
	  if(event.which === 13) {
	  	if(!username) {
	  		setUsername();
	  	}
	  	else if(!numOfUsers){
				setNumUsers();
				selectChars();
			}
		}
	})

});