var Promise = require('bluebird');
var _ = require('lodash');

function MoveRound(settings) {
	/** Type of this object */
	this.__promisemonopolytype = 'MoveRound';
	/** Players who started this MoveRound */
	this.__participatingPlayers;
	/** Save settings object */
	this.__settings = settings;

};

MoveRound.prototype.initialize = function(parentWorld, players) {

	console.log("INIT: MoveRound");

	// Create local state object that goes around while
	// this MoveRound exists!

	// Any return value from here will be passed to this.start!

	// Save copy of players so we know who are participating to this MoveRound
	this.__participatingPlayers = _.slice(players);

	return {};
}
/**
* Starts a moveRound and plays it through
* @param localWorld - Local state of this MoveRound object
* @returns Promise - Promise to be fulfilled when moveRound is over
*/
MoveRound.prototype.start = function(localWorld) {

	return this.loopRound(this.__participatingPlayers, localWorld);

}

MoveRound.prototype.loopRound = function(players, localWorld) {
	return this.oneRound(players, localWorld)
	// Filter away players who did not survive the round
	.then(_.compact)
	.then(function(remainingPlayers) {
		console.log("Remainingp players len: " + remainingPlayers.length);
		if (this.__settings.loop && remainingPlayers.length > 0) {
			return this.loopRound(remainingPlayers, localWorld);
		}
		// MoveRound is over
		return this.destroy(localWorld);
	}.bind(this));

}

MoveRound.prototype.oneRound = function(players, localWorld) {

	return Promise.mapSeries(players, function(player) {
		// Tell player to make a move and start waiting for the move
		return player.move()
		// Returns [true, move] if legal, otherwise [false, move];
		.then(function(move) {
			var isLegal = this.checkMoveLegality(move, localWorld);
			return [isLegal, move];
		}.bind(this))
		// Handle legal and illegal moves
		// Illegal: You probably want to just retry turn or remove player 
		// Legal: You probably want to mutate localWorld based on move
		.spread(function(isLegal, move) {
			var handleRes;
			if (isLegal === false) handleRes = this.handleIllegalMove(move, localWorld)
			else if (isLegal === true) handleRes = this.handleLegalMove(move, localWorld)
			else throw "Move legality did not return TRUE/FALSE: " + isLegal;	

			if (handleRes === true) return player; // Allows to participate to next round
			return null; // Removes player from next round
		}.bind(this))
	}.bind(this));

}

MoveRound.prototype.destroy = function(localWorld) {
	console.log("DESTROY: MoveRound");
	return localWorld;
}

module.exports = MoveRound;

