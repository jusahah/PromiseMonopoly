var Promise = require('bluebird');
var _ = require('lodash');

// Action exceptions
var RetryTurn = require('./actions/RetryTurn');
var EndGame = require('./actions/EndGame');
var EndMoveRound = require('./actions/EndMoveRound');

// Errors
var ExtendError = require('./errors/ExtendError');

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

/**
* Conventions:

* Functions starting 'this.__' are defined in parent (MoveRound). They are not meant
* to be extended by client-code.
*
* Other functions are defined in child classes. They are meant to be extended by client-code.
*/

/* Extending classes must provide at least following methods:
*
* 'initializeLocalWorld(parentWorld, players)'
* 'checkMoveLegality(move, localWorld, player, actions)'
* 'handleIllegalMove(move, localWorld, player, actions)'
* 'handleLegalMove(move, localWorld, player, actions)'
*/

function MoveRound(settings) {
	this.__phaseName = 'MoveRound';
	/** Type of this object */
	this.__promisemonopolytype = 'MoveRound';
	/** Players who started this MoveRound */
	this.__participatingPlayers;
	/** Save settings object */
	this.__settings = settings;
	/** Keeps track of local state during moveRound */
	this.__localWorld;

};

MoveRound.prototype.__initialize = function(parentWorld, players) {

	console.log("INIT: " + this.__phaseName);

	// Create local state object that goes around while
	// this MoveRound exists!

	// Any return value from here will be passed to this.start!

	// Save copy of players so we know who are participating to this MoveRound
	this.__participatingPlayers = _.slice(players);

	// Call user-defined initializing of localWorld
	this.__localWorld = this.initializeLocalWorld(parentWorld, _.slice(players));
	return true;

}
/**
* Starts a moveRound and plays it through
* @param localWorld - Local state of this MoveRound object
* @returns Promise - Promise to be fulfilled when moveRound is over
*/
MoveRound.prototype.__start = function() {

	return this.__loopRound(this.__participatingPlayers, this.__localWorld);

}

MoveRound.prototype.__loopRound = function(players, localWorld) {
	var playersStartingCount = players.length;
	return this.__oneRound(players, localWorld)
	// Filter away players who did not survive the round
	.then(_.compact)
	.then(function(remainingPlayers) {
		console.log("Remainingp players len: " + remainingPlayers.length);
		
		if (remainingPlayers.length !== playersStartingCount) {
			this.remainingPlayersAmountChanged(localWorld, remainingPlayers, actions);
		}

		if (this.__settings.loop && remainingPlayers.length > 0) {
			return this.__loopRound(remainingPlayers, localWorld);
		}


		// MoveRound is over
		actions.endMoveRound();
	}.bind(this))
	.catch(EndMoveRound, function() {
		return this.__destroy(localWorld);
	}.bind(this));

}

MoveRound.prototype.__oneRound = function(players, localWorld) {

	return Promise.mapSeries(players, function(player) {
		return this.__oneMove(player, localWorld, 1160);
	}.bind(this));

}

MoveRound.prototype.__oneMove = function(player, localWorld, timeleft, retryCount) {
	retryCount = retryCount || 0;
	this.__broadcast({
		topic: 'player_tomove',
		gameID: 1,
		playerID: player.getID(),
		retryCount: retryCount
	});

	var dataForMove = this.beforeMoveRequest(localWorld, retryCount);
	// Tell player to make a move and start waiting for the move
	return player.move(dataForMove).timeout(timeleft)
	// Returns [true, move] if legal, otherwise [false, move];
	.then(function(move) {
		return this.afterMoveReceived(move, retryCount);
	}.bind(this))
	.then(function(move) {
		var isLegal = this.checkMoveLegality(move, localWorld, player, actions);
		return [isLegal, move];
	}.bind(this))
	// Handle legal and illegal moves
	// Illegal: You probably want to just retry turn or remove player 
	// Legal: You probably want to mutate localWorld based on move
	.spread(function(isLegal, move) {
		var handleRes;
		if (isLegal === false) {
			handleRes = this.handleIllegalMove(move, localWorld, player, actions)
		} 
		else if (isLegal === true) {
			handleRes = this.handleLegalMove(move, localWorld, player, actions)
		}
		else {
			throw new ExtendError("Move legality did not return TRUE/FALSE: " + isLegal);	
		}

		if (handleRes === true) {
			this.__broadcast({
				topic: 'new_world',
				gameID: 1,
				world: this.broadcastNewWorld(localWorld)
			});
			return player; // Allows to participate to next round
		}
		return null; // Removes player from next round
	}.bind(this))
	.catch(Promise.TimeoutError, function() {
		console.log("Player timed out");
		this.__broadcast({
			topic: 'player_timeout',
			gameID: 1,
			playerID: player.getID()
		});
		// Note!
		// You can also return from catch and thus continue Promise chain!!
		return this.handleTimeout(localWorld, player, actions);
	}.bind(this))
	.catch(RetryTurn, function() {
		//console.log("Retrying player turn");
		return this.__oneMove(player, localWorld, timeleft, retryCount+1);
	}.bind(this))	
}

MoveRound.prototype.__broadcast = function(msg) {

	_.map(this.__participatingPlayers, function(player) {
		player.msg(msg);
	})

}

MoveRound.prototype.__destroy = function(localWorld) {
	console.log("DESTROY: " + this.__phaseName);
	return localWorld;
}

MoveRound.prototype.beforeMoveRequest = function() {
	return true;
}

MoveRound.prototype.afterMoveReceived = function(move, retryCount) {
	return move;
}

MoveRound.prototype.handleTimeout = function(localWorld, player, actions) {
	return false;
}

MoveRound.prototype.checkMoveLegality = function(move, localWorld, player, actions) {
	return true;
}

MoveRound.prototype.handleIllegalMove = function(move, localWorld, player, actions) {	
	actions.retryTurn(); // Make player move again
} 

MoveRound.prototype.handleLegalMove = function(move, localWorld, player, actions) {
	return true;
}

MoveRound.prototype.remainingPlayersAmountChanged = function(localWorld, players, actions) {
	return true;
}
MoveRound.prototype.broadcastNewWorld = function(localWorld) {
	return localWorld;
}


module.exports = MoveRound;

