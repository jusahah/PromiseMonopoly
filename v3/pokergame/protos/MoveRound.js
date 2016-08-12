var Promise = require('bluebird');
var _ = require('lodash');

var recursiveLog = require('../../recursiveLog');

// Action exceptions
var SkipMove = require('../../actions/SkipMove');
var RetryTurn = require('../../actions/RetryTurn');
var EndGame = require('../../actions/EndGame');
var EndMoveRound = require('../../actions/EndMoveRound');

// Errors
var ExtendError = require('../../errors/ExtendError');

var actions = {
	skipMove: function() {
		throw new SkipMove();
	},
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
	/** Keeps track of global state during moveRound */
	this.__globalStatePointer

};

MoveRound.prototype.__initialize = function(globalState, players) {

	//console.log("INIT: " + this.__phaseName);

	// Create local state object that goes around while
	// this MoveRound exists!

	// Any return value from here will be passed to this.start!

	// Save copy of players so we know who are participating to this MoveRound
	this.__participatingPlayers = _.slice(players);

	// Call user-defined initializing of localWorld
	this.onEnter(globalState, _.slice(players));
	this.__globalStatePointer = globalState;
	return true;

}
/**
* Starts a moveRound and plays it through
* @param localWorld - Local state of this MoveRound object
* @returns Promise - Promise to be fulfilled when moveRound is over
*/
MoveRound.prototype.__start = function() {
	recursiveLog.push();
	recursiveLog.log('START: MoveRound');
	return this.__loopRound(this.__participatingPlayers);

}

MoveRound.prototype.__loopRound = function(players) {

	console.log("-----LOOP ROUND: " + players.length);

	var playersStartingCount = players.length;
	this.beforeLoopRound(this.__globalStatePointer, players);
	return this.__oneRound(players)
	// Filter away players who did not survive the round
	.then(_.compact)
	.tap(function(remainingPlayers) {
		this.afterLoopRound(this.__globalStatePointer, remainingPlayers);
	}.bind(this))
	.then(function(remainingPlayers) {
		//console.log("Remainingp players len: " + remainingPlayers.length);
		
		if (remainingPlayers.length !== playersStartingCount) {
			this.remainingPlayersAmountChanged(this.__globalStatePointer, remainingPlayers, actions);
		}

		if (this.__settings.loop && remainingPlayers.length > 0) {
			return this.__loopRound(remainingPlayers, this.__globalStatePointer);
		}


		// MoveRound is over
		actions.endMoveRound();
	}.bind(this))
	.catch(EndMoveRound, function() {
		console.warn("EndMoveRound caught")
		this.__broadcast({
			topic: 'new_world',
			world: this.broadcastNewWorld(this.__globalStatePointer)
		});
		return this.__destroy(this.__globalStatePointer);
	}.bind(this));

}

MoveRound.prototype.__oneRound = function(players) {
	recursiveLog.log('START: Individual round of moves');
	return Promise.mapSeries(players, function(player) {
		if (player.hasDisconnected()) return null;
		return this.__oneMove(player, 5160);
	}.bind(this));

}

MoveRound.prototype.__oneMove = function(player, timeleft, retryCount) {
	recursiveLog.log('-Request: Individual move for: ' + player.getID());
	retryCount = retryCount || 0;
	this.__broadcast({
		topic: 'player_tomove',
		playerID: player.getID(),
		retryCount: retryCount
	});
	// Should throw SkipMove if player not to move this turn!
	
	// Tell player to make a move and start waiting for the move
	return Promise.try(function() {
		return this.beforeMove(this.__globalStatePointer, player, retryCount, actions);
	}.bind(this))
	.then(function(dataForMove) {
		return player.move(dataForMove).timeout(timeleft)
	})
	// Returns [true, move] if legal, otherwise [false, move];
	.then(function(move) {
		var isLegal = this.checkMoveLegality(move, this.__globalStatePointer, player, actions);
		return [isLegal, move];
	}.bind(this))
	// Handle legal and illegal moves
	// Illegal: You probably want to just retry turn or remove player 
	// Legal: You probably want to mutate localWorld based on move
	.spread(function(isLegal, move) {
		var handleRes;
		if (isLegal === false) {
			handleRes = this.handleIllegalMove(move, this.__globalStatePointer, player, actions)
		} 
		else if (isLegal === true) {
			handleRes = this.handleLegalMove(move, this.__globalStatePointer, player, actions)

		}
		else {
			throw new ExtendError("Move legality did not return TRUE/FALSE: " + isLegal);	
		}

		if (handleRes === true) {
			this.__broadcast({
				topic: 'new_world',
				world: this.broadcastNewWorld(this.__globalStatePointer)
			});			
			this.afterMove(this.__globalStatePointer, retryCount, actions);
			return player; // Allows to participate to next round
		}

		this.afterMove(this.__globalStatePointer, retryCount, actions);

		return null; // Removes player from next round
	}.bind(this))
	.catch(Promise.TimeoutError, function() {
		console.error("Player timed out");
		this.__broadcast({
			topic: 'player_timeout',
			playerID: player.getID()
		});
		// Note!
		// You can also return from catch and thus continue Promise chain!!
		return this.handleTimeout(this.__globalStatePointer, player, actions);
	}.bind(this))
	.catch(SkipMove, function() {
		console.warn("----------SKIP MOVE CAUGHT-----------")
		return null;
	})
	.catch(RetryTurn, function() {
		console.log("Retrying player turn");
		return this.__oneMove(player, timeleft, retryCount+1);
	}.bind(this))
	// We practically need to catch and rethrow all terminal exceptions so that we
	// can in between catch and rethrow broadcast new state one last time.
	.catch(function(err) {
		// Broadcast first, then rethrow
		this.__broadcast({
			topic: 'new_world',
			world: this.broadcastNewWorld(this.__globalStatePointer)
		});
		throw err;
	}.bind(this))	
}

MoveRound.prototype.__broadcast = function(msg) {

	_.map(this.__participatingPlayers, function(player) {
		player.msg(msg);
	})

}

MoveRound.prototype.beforeLoopRound = function(globalState, players) {
	recursiveLog.log2('Hook: beforeLoopRound');
}

MoveRound.prototype.afterLoopRound = function(globalState, players) {
	recursiveLog.log2('Hook: afterLoopRound');
}

MoveRound.prototype.onEnter = function(globalState, players) {
	globalState.moverounds++;
}


MoveRound.prototype.onExit = function(globalState) {
	return true;
}

MoveRound.prototype.__destroy = function(globalState) {
	recursiveLog.log('STOP: MoveRound');
	recursiveLog.pop();
	this.onExit(this.__globalStatePointer);
	//console.log("DESTROY: " + this.__phaseName);
	return globalState;
}

MoveRound.prototype.beforeMove = function(globalState, retryCount, actions) {
	recursiveLog.log2('Hook: beforeMove');
	return true;
}

MoveRound.prototype.afterMove = function(globalState, retryCount, actions) {
	recursiveLog.log2('Hook: afterMove');
	return move;
}

MoveRound.prototype.handleTimeout = function(globalState, player, actions) {
	recursiveLog.log2('Hook: handleTimeout');
	return false;
}

MoveRound.prototype.checkMoveLegality = function(move, globalState, player, actions) {
	recursiveLog.log2('Hook: checkMoveLegality');
	return Math.random() < 1;
	return true;
}

MoveRound.prototype.handleIllegalMove = function(move, globalState, player, actions) {	
	recursiveLog.log2('Hook: handleIllegalMove');
	actions.retryTurn(); // Make player move again
} 

MoveRound.prototype.handleLegalMove = function(move, globalState, player, actions) {
	recursiveLog.log2('Hook: handleLegalMove');
	return true;
}

MoveRound.prototype.remainingPlayersAmountChanged = function(globalState, players, actions) {
	recursiveLog.log2('Hook: remainingPlayersAmountChanged');
	return true;
}
MoveRound.prototype.broadcastNewWorld = function(globalState) {
	recursiveLog.log2('Hook: broadcastNewWorld');
	return globalState;
}


module.exports = MoveRound;

