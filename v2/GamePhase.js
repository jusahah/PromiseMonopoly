var Promise = require('bluebird');
var _ = require('lodash');

// Action exceptions
var RetryTurn = require('./actions/RetryTurn');
var EndGame = require('./actions/EndGame');
var EndMoveRound = require('./actions/EndMoveRound');

var actions = {
	retryTurn: function() {
		throw new RetryTurn();
	},
	endGame: function() {
		throw new EndGame();
	},
	endMoveRound: function() {
		throw new EndMoveRound;
	}
}

function GamePhase(phaseName, settings, subphases) {

	this.__phaseName = phaseName;

	this.__subphases = subphases || [];
	/** Save settings object */
	this.__settings = settings;

	this.__localWorld;
	this.__participatingPlayers;

	this.__initialize = function(parentWorld, players) {
		console.log(JSON.stringify(parentWorld))
		console.log("INIT: " + this.__phaseName);
		console.log("Players len: " + players.length);
		console.log("World: " + parentWorld.gamesPlayed)
		this.__participatingPlayers = _.slice(players);
		this.__localWorld = this.initializeLocalWorld(parentWorld, _.slice(players));

		return true;

	}

	this.__start = function() {
		return this.__oneLoop()
		.tap(this.__destroy.bind(this));
	}

	this.__oneLoop = function() {
		this.beforeLoop(this.__localWorld, actions);
		return Promise.mapSeries(this.__subphases, function(subphase) {
			// Check if its moveRound
			subphase.__initialize(this.__localWorld, this.__participatingPlayers);
			return subphase.__start();
		}.bind(this))
		.then(function() {
			this.afterLoop(this.__localWorld, actions);
			if (this.__settings.loop) return this.__oneLoop();
			return true;
		}.bind(this));

	}

	this.__destroy = function() {
		this.beforeDestroy(this.__localWorld);
		console.log("DESTROY: " + this.__phaseName);

	}

	this.__broadcast = function(msg) {
		_.map(this.__participatingPlayers, function(player) {
			player.msg(msg);
		})
	}

	this.initializeLocalWorld = function(parentWorld) {
		return parentWorld;
	}

}

module.exports = GamePhase;