var Promise = require('bluebird');
var _ = require('lodash');

// Exceptions
var GameEnded = require('../exceptions/GameEnded');
var RetryTurn = require('../exceptions/RetryTurn');
var WinnerDeclared = require('../exceptions/WinnerDeclared');
var DrawDeclared = require('../exceptions/DrawDeclared');

module.exports = function GameInProgress(game, initialWorld) {
	/** Game state */
	this.world = initialWorld;
	/** Link back to Game object */
	this.gameLink = game;

	this.name = 'GameInProgress';

	this.startRoundLooping = function() {
		var players = this.gameLink._players;

		return playOneRound(players, 1, this.world, this);
	}

	//_.delay(this.startRoundLooping.bind(this), 0);

}

var maxTime = 1450;


function playOneRound(players, nthRound, world, stateObj) {

	var actions = {
		declareWinner: function(player) {
			throw new WinnerDeclared(player.id + " won the game!");
		},
		declareDraw: function() {
			throw new DrawDeclared("No winner - game drawn.");
		},
		giveTurnBack: function() {
			throw new RetryTurn();
		},
		customMsgAll: function(msg) {
			_.map(players, function(player) {
				player.customMsg(msg);
			})

		}

	}
	console.log("Starting round: " + nthRound)

	function moveHandling(move, player, illegalCount) {
		return Promise.resolve(move)
		// Receive player move and decide its legality
		.then(function(move) {
			return [move, decideMoveLegality(world, player, move, actions)]
		})
		// Call either legal or illegal handler depending on move legality
		.spread(function(move, isLegal) {
			//console.log(move);
			console.log(player.id + " is legal move? " + isLegal)
			if (isLegal === true) return handleLegalMove(world, player, move, actions);
			else if (isLegal === false) return handleIllegalMove(world, player, move, actions, illegalCount);	
			throw "Move legality checker did not return TRUE/FALSE: " + isLegal;
		})			
	}

	function timeoutHandling(player) {
		return handleTimeout(world, player, actions);
	}

	function runOnePlayer(player, illegalCount) {
		console.log("Illegal count now: " + illegalCount)
		if (player.hasDisconnected) {
			// Player has disconnected while waiting his turn
			// We simply migrate to next player right away
			return null;
		}

		illegalCount = illegalCount || 0;
		// Give the control to player
		return Promise.any([
			// Player makes a move...
			player.yourMove(), 
			// ... or delay Promise goes first in case player is too slow!
			Promise.delay(470).return({timeout: true})
		])
		// Check whether player timed out
		.then(function(move) {
			// Check if timed out
			if (_.has(move, 'timeout') && move.timeout === true) {
				return timeoutHandling(player);
			}
			return moveHandling(move, player, illegalCount)
		})			
		// Decide whether to keep player around for the next round
		.then(function(keepPlayer) {
			// If we want to keep the player, we return player object
			if (keepPlayer === true) return player;
			else if (keepPlayer === false) {
				console.log("Player lost: " + player.id);
				return null;
			}
			throw "Move handling function did not return TRUE/FALSE: " + keepPlayer;
		}) 
		.catch(RetryTurn, function() {
			// Repeat this turn
			console.log("Retrying player turn: " + player.id);
			return runOnePlayer(player, illegalCount+1);
		})			

	}

	return Promise.mapSeries(players, function(p) {
		return runOnePlayer(p, 0);
	})
	.tap(function(){
		console.log("----------")
		console.log('WORLD STATE NOW: ' + world.c)
		console.log("----------")

	})
	.then(_.compact)
	.then(function(remainingPlayers) {
		console.log("Round played - remaining: " + remainingPlayers.length);
		if (remainingPlayers.length === 1) {
			// Game has ended
			var winner = remainingPlayers[0];
			actions.declareWinner(winner);
		} else if (remainingPlayers.length === 0) {
			actions.declareDraw();
		}

		return playOneRound(remainingPlayers, nthRound+1, world, stateObj);
	});
}

/** 
* Decides whether move from player is legal in the given game state
* @param {Object} world - The global game state.
* @param {Object} player - The player who made the move
* @param {Object} move - The move object
* @param {Object} actions - Obj containing game actions
* @returns {Boolean} False === illegal, True === legal.
*/
function decideMoveLegality(world, player, move, actions) {
	// This function is 'gate-keeper'
	return Math.random() < 0.5;
}

/** 
* Handles illegal moves from player. Legality determined by 'decideMoveLegality'.
* @param {Object} world - The global game state.
* @param {Object} player - The player who made the move
* @param {Object} move - The move object
* @param {Object} actions - Obj containing game actions
* @returns {Boolean} False === player removed from game, True === player remains in the game.
*/
function handleIllegalMove(world, player, move, actions, illegalCount) {
	// Note that this function must return explicitly false or true
	// Other falsy or truthy values are NOT okay to return (will throw exception)
	//////// SUGGESTIONS WHAT TO DO HERE //////////
	// 1) Remove player (turn is given to next player) or...
	// 2) Give turn back to current player or...
	// 3) Give turn to next player but keep current player in game.
	///////////////////////////////////////////////

	if (illegalCount > 2) return false;

	return actions.giveTurnBack();

}

/** 
* Handles legal moves from player. Legality determined by 'decideMoveLegality'.
* @param {Object} world - The global game state.
* @param {Object} player - The player who made the move
* @param {Object} move - The move object
* @param {Object} actions - Obj containing game actions
* @returns {Boolean} False === player removed from game, True === player remains in the game.
*/
function handleLegalMove(world, player, move, actions) {
	// Note that this function must return explicitly false or true
	// Other falsy or truthy values are NOT okay to return (will throw exception)
	//////// SUGGESTIONS WHAT TO DO HERE //////////
	// 1) Modify game state, give turn to next player.
	///////////////////////////////////////////////

	// Test modify global game state
	world.c++;

	return true;

}

/** 
* Handles timeout events. Timeout means the player did not move in time
* @param {Object} world - The global game state.
* @param {Object} player - The player who timed out
* @param {Object} actions - Obj containing game actions
* @returns {Boolean} False === player removed from game, True === player remains in the game.
*/
function handleTimeout(world, player, actions) {
	// Note that this function must return explicitly false or true
	// Other falsy or truthy values are NOT okay to return (will throw exception)	
	//////// SUGGESTIONS WHAT TO DO HERE //////////
	// 1) Remove player from game (return false) or...
	// 2) Give player penalty points (modify game state, return true) or...
	// 3) Do nothing, but give turn to next player (return true)
	///////////////////////////////////////////////

	// Default
	console.log("PLAYER TIMED OUT!!!!!!!!!");
	player.customMsg({
		topic: 'timeout',
		msg: 'You were too slow to move!'
	});
	world.timeouts++;
	return false;

}

function handlePlayerDisconnected(world, player, actions) {
	console.log("Player has disconnected");
	actions.customMsgAll({
		topic: 'disconnected',
		player: player.id
	});

}

/** 
* Handles untimely move from player. Untimely means it was NOT player's turn to move.
* Note that
* @param {Object} world - The global game state.
* @param {Object} player - The player who made the move
* @param {Object} actions - Obj containing game actions
* @returns {Boolean} False === player removed from game, True === player remains in the game.
*/
function handleUntimelyMove(world, player, actions) {
	// Note that this function must return explicitly false or true
	// Other falsy or truthy values are NOT okay to return (will throw exception)
	//////// SUGGESTIONS WHAT TO DO HERE //////////
	// 1) Nothing.
	// 2) Keep a counter of how many times she has done this. When too many, remove player.
	
	// Default
	return true;
}