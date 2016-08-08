var Promise = require('bluebird');
var _ = require('lodash');

var Game = require('../Game');

var CARDS = [
	['Ah', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh'],
	['As', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks'],
	['Ac', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc'],
	['Ad', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd']
];

function PokerHand(initialWorld, phases) {

	Game.call(this, initialWorld, phases);

	this.initializeLocalWorld = function(world, players) {
		// Deal cards to each players!
		var cardsInPlay = _.flatten(CARDS);

		var playersByID = _.keyBy(players, function(player) {
			return player.getID();
		});

		return _.mapValues(playersByID, function(player) {
			return {chips: world.chips, hand: _.sampleSize(cardsInPlay, 2)}
		});

	}

	this.beforeRegistration = function(
		user, 
		players, 
		registrationPreventAction, 
		registerAndStartGameAction
	) {
		if (players.length === 8) {
			// Full table
			return registrationPreventAction();
		}

		return true;
	}
}

// Set prototype link
PokerHand.prototype = Object.create(Game.prototype);


module.exports = PokerHand;