var Promise = require('bluebird');
var _ = require('lodash');

var Game = require('./Game');

function ChessMatch(initialWorld, phases) {

	Game.call(this, initialWorld, phases);

	this.beforeRegistration = function(
		user, 
		players, 
		registrationPreventAction, 
		registerAndStartGameAction
	) {
		// Define logic for deciding whether to accept registration or not
		// I.e whether the game is already full of players (i.e chess can have only 2)
		console.log("--- ChessMatch before reg running: " + players.length + " ---");
		// Two players already in, reject registration
		if (players.length === 2) return registrationPreventAction();
		// Second player registering, put him in and start
		if (players.length === 1) {
			// Already filled!
			return registerAndStartGameAction();
			//throw registrationPreventException;
		}
		// First player registering
		// Return true if you want to register player while still keeping registration open.
		return true;

		
	}
}

// Set prototype link
ChessMatch.prototype = Object.create(Game.prototype);


module.exports = ChessMatch;