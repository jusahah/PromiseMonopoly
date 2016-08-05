var Promise = require('bluebird');
var _ = require('lodash');

function GamePhase(phaseName, subphases) {

	this.__phaseName = phaseName;

	this.__subphases = subphases || [];

	this.__localWorld;
	this.__participatingPlayers;

	this.__initialize = function(parentWorld, players) {
		console.log("INIT: " + this.__phaseName);
		console.log("Players len: " + players.length);
		this.__participatingPlayers = _.slice(players);
		this.__localWorld = this.initializeLocalWorld(parentWorld, _.slice(players));

		return true;

	}

	this.__start = function() {
		return Promise.mapSeries(this.__subphases, function(subphase) {
			// Check if its moveRound
			subphase.__initialize(this.__localWorld, this.__participatingPlayers);
			return subphase.__start();
		}.bind(this))
		.tap(this.__destroy.bind(this));

	}

	this.__destroy = function() {
		console.log("DESTROY: " + this.__phaseName);

	}

	this.initializeLocalWorld = function() {
		return {w: 0};
	}

}

module.exports = GamePhase;