var Promise = require('bluebird');
var _ = require('lodash');

var GamePhase = require('./GamePhase');

function ChessGame(settings, phases) {

	GamePhase.call(this, 'ChessGame', settings, phases);

	this.beforeLoop = function(localWorld, actions) {
		console.log("Games played: " + localWorld.gamesPlayed)	
		// If already enoguh games, end the match
		if (localWorld.gamesPlayed === 5) {
			actions.endGame();
		}	
	}

	this.afterLoop = function(localWorld, actions) {
		localWorld.gamesPlayed++;
	} 

	this.beforeDestroy = function(localWorld) {
		//localWorld.gamesPlayed++;
	}
}

// Set prototype link
ChessGame.prototype = Object.create(GamePhase.prototype);


module.exports = ChessGame;