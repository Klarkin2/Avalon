var _ = require('lodash');


exports.makeCharacterList = function(names, usedChars, num) {
	var numB = (num < 7) ? 2 :
						 (num < 10) ? 3 : 4;
	var numG = num - numB;

	_.forEach(usedChars, function (characters) {
		(characters['side'] === 'g') ? numG-- : numB--;
	});

	for(var i = 0; i < numB; i++)
		usedChars.push(bChar[i]);
	for(var i = 0; i < numG; i++)
		usedChars.push(gChar[i]);
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
	});
	return characters;
};

//gives the characters their knowledge about other players
var charactersKnowledge = function (characters) {
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

//gives a random number between min and max
function randomBetween(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

exports.specialChar = [
	{
		player: null,
		name: 'Merlin',
		side: 'g',
		revealMerlin: false,
		revealPercival: true,
		revealEvil: false,
		filename: "Merlin.png"
	},
	{
		player: null,
		name: 'Percival',
		side: 'g',
		revealMerlin: false,
		revealPercival: false,
		revealEvil: false,
		filename: "Percival.png"
	},
	{
		player: null,
		name: 'Morgana',
		side: 'e',
		revealMerlin: true,
		revealPercival: true,
		revealEvil: true,
		filename: "Morgana.png"
	},
	{
		player: null,
		name: 'Mordred',
		side: 'e',
		revealMerlin: false,
		revealPercival: false,
		revealEvil: true,
		filename: "Mordred.png"
	},
	{
		player: null,
		name: 'Oberon',
		side: 'e',
		revealMerlin: true,
		revealPercival: false,
		revealEvil: false,
		filename: "Oberon.png"
	}
];

var bChar = [
	{
		player: null,
		name: 'Assassin',
		side: 'e',
		revealMerlin: true,
		revealPercival: false,
		revealEvil: true,
		filename: "Assassin.png"
	},
	{
		player: null,
		name: 'Minion of Mordred',
		side: 'e',
		revealMerlin: true,
		revealPercival: false,
		revealEvil: true,
		filename: "Minion1.png"
	},
	{
		player: null,
		name: 'Minion of Mordred',
		side: 'e',
		revealMerlin: true,
		revealEvil: true,
		filename: "Minion2.png"
	},
	{
		player: null,
		name: 'Minion of Mordred',
		side: 'e',
		revealMerlin: true,
		revealPercival: false,
		revealEvil: true,
		filename: "Minion3.png"
	},
];

var gChar = [
	{
		player: null,
		name: 'Loyal Servant of Arthur',
		side: 'g',
		revealMerlin: false,
		revealPercival: false,
		revealEvil: false,
		filename: "Loyal1.png"
	},
	{
		player: null,
		name: 'Loyal Servant of Arthur',
		side: 'g',
		revealMerlin: false,
		revealPercival: false,
		revealEvil: false,
		filename: "Loyal2.png"
	},
	{
		player: null,
		name: 'Loyal Servant of Arthur',
		side: 'g',
		revealMerlin: false,
		revealPercival: false,
		revealEvil: false,
		filename: "Loyal3.png"
	},
	{
		player: null,
		name: 'Loyal Servant of Arthur',
		side: 'g',
		revealMerlin: false,
		revealPercival: false,
		revealEvil: false,
		filename: "Loyal4.png"
	}
];