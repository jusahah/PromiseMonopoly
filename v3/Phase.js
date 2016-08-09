var Promise = require('bluebird');
var _ = require('lodash');

// Action exceptions
var RetryTurn = require('./actions/RetryTurn');
var EndGame = require('./actions/EndGame');
var EndMoveRound = require('./actions/EndMoveRound');

var recursiveLog = require('./recursiveLog');

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

function Phase(phaseName, settings, subphases) {

	this.__phaseName = phaseName;

	this.__subphases = subphases || [];
	/** Save settings object */
	this.__settings = settings;

	this.__globalStatePointer;

	this.__participatingPlayers;

	this.__initialize = function(globalState, players) {
		//console.log(JSON.stringify(globalState))
		//console.log("INIT: " + this.__phaseName);
		//console.log("Players len: " + players.length);
		this.__participatingPlayers = _.slice(players);
		this.__globalStatePointer = globalState;
		this.onEnter(this.__globalStatePointer);
		this.__broadcast({
			topic: 'new_world',
			world: this.broadcastNewWorld(this.__globalStatePointer)
		});

		return true;

	}

	this.__start = function() {
		recursiveLog.push();
		recursiveLog.log('START: Phase ' + this.__phaseName);
		
		return this.__oneLoop()
		.tap(this.__destroy.bind(this));
	}

	this.__oneLoop = function() {
		this.beforeLoop(this.__globalStatePointer, actions);
		return Promise.mapSeries(this.__subphases, function(subphase) {
			// Check if its moveRound
			subphase.__initialize(this.__globalStatePointer, this.__participatingPlayers);
			return subphase.__start();
		}.bind(this))
		.then(function() {
			this.afterLoop(this.__globalStatePointer, actions);
			if (this.__settings.loop) return this.__oneLoop();
			return true;
		}.bind(this));

	}

	this.__destroy = function() {
		recursiveLog.log('STOP: Phase ' + this.__phaseName);
		recursiveLog.pop();
		this.onExit(this.__globalStatePointer);
		this.beforeDestroy(this.__globalStatePointer);
		//console.log("DESTROY: " + this.__phaseName);

	}

	this.__broadcast = function(msg) {
		_.map(this.__participatingPlayers, function(player) {
			player.msg(msg);
		})
	}

	this.onEnter = function(globalState) {
		globalState.phases++;
	}

	this.onExit = function(globalState) {
		return true;
	}

	this.initializeLocalWorld = function(globalState) {
		return globalState;
	}

	this.beforeLoop = function() {
		return true;
	}

	this.afterLoop = function() {
		return true;
	}

	this.beforeDestroy = function() {
		return true;
	}

	this.broadcastNewWorld = function(globalState) {
		return globalState;
	}
}

module.exports = Phase;


/*

Always pass a pointer to global state around!! (subphases can then implement their
own stack of local states on it)

GamePhase = {
	
	this.onEnter = function() {},
	this.onExit  = function() {},
	this.beforeLoop = function() {},
	this.afterLoop = function() {},
	this.broadcastNewWorld = function() {}
}

Game = {
	
	this.register,
	this.start,

	this.onStart,
	this.onEnd,

	this.broadcastNewWorld
}

MoveRound = {
	
	this.beforeMove,
	this.afterMove,

	this.beforeRound,
	this.afterRound,

	this.handleTimeout,
	this.handleLegalMove,
	this.handleIllegalMove,
	this.checkMoveLegality,

	this.broadcastNewWorld,
	this.remainingPlayersAmountChanged

}

*/

