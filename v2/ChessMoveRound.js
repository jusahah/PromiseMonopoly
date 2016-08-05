var Promise = require('bluebird');
var _ = require('lodash');

// Domain deps
var Chess = require('chess.js').Chess;

// Protos
var MoveRound = require('./MoveRound');

function ChessMoveRound(settings) {
	// Pass settings to super-class constructor
	MoveRound.call(this, settings);

	this.initializeLocalWorld = function(parentWorld, players) {
		// Initialize new board
		return {chess: new Chess()};
	}

	this.checkMoveLegality = function(move, localWorld, player, actions) {
		if (!localWorld.chess.move(move)) return false;

		// Move is legal, we need to take it back as this is not place to modify state.
		localWorld.chess.undo();
		return true;
	}

	this.handleTimeout = function(localWorld, player, actions) {
		actions.retryTurn();
	}

	this.handleIllegalMove = function(move, localWorld, player, actions) {
		console.log("ChessMoveRound: Handle ILLEGAL")
		localWorld.illegals++;		
		actions.retryTurn(); // Make player move again
	} 

	this.handleLegalMove = function(move, localWorld, player, actions) {
		//console.log("ChessMoveRound: Handle LEGAL")
		localWorld.chess.move(move);
		return true;
	}

	this.broadcastNewWorld = function(localWorld) {
		/* Return object to want to be broadcasted as new state */
		return localWorld.chess.fen();
	}

	this.beforeMoveRequest = function(localWorld) {
		// Return value will be passed to player.move()!
		return localWorld.chess.moves();
	}

	this.afterMoveReceived = function(move, retryCount) {
		return move;
	}

}


// Set prototype link
ChessMoveRound.prototype = Object.create(MoveRound.prototype);


module.exports = ChessMoveRound;
