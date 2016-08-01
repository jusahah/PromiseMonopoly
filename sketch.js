var Promise = require('bluebird');
var _ = require('lodash');

// Exceptions
var GameEnded = require('./exceptions/GameEnded');

// Sketching the main loop for the game

var players = [
	{
		id: 'A'
	},
	{
		id: 'B'
	},
	{
		id: 'C'
	},
	{
		id: 'D'
	},
	{
		id: 'E'
	}
];

Promise.try(function() {
	var initialWorld = {
		c: 1
	};

	startGame(initialWorld, players);
})
.catch(GameEnded, function() {
	console.log("Game ended");
})
.catch(function(err) {
	console.log("Something went wrong");
	// Rethrow
	throw err;
});


function startGame(players) {

	function playOneRound(players, nthRound) {
		console.log("Starting round: " + nthRound)
		return Promise.mapSeries(players, function(player) {
			return handleMove(world, player, {
				declareWinner: function() {
					throw new WinnerDeclared();
				},
				declareDraw: function() {
					throw new DrawDeclared();
				},
				
			})
		})
		.then(_.compact)
		.then(function(remainingPlayers) {
			console.log("Round played - remaining: " + remainingPlayers.length);
			if (remainingPlayers.length <= 1) {
				// Game has ended
				throw new GameEnded();
			}

			return playOneRound(remainingPlayers, nthRound+1);
		});
	}

	return playOneRound(players, 1);
}



function playerMoves(world, player, actions) {

	console.log("Player about to move: " + player.id);

	return Promise.delay(500).then(function() {
		if (Math.random() < 0.1) return null;
		return player;
	})

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


}

/** 
* Handles moves from player. Both legal AND illegal.
* @param {Object} world - The global game state.
* @param {Object} player - The player who made the move
* @param {Object} move - The move object
* @param {Object} actions - Obj containing game actions
* @returns {Boolean} False === player removed from game, True === player remains in the game.
*/
function handleIllegalMove(world, player, move, actions) {
	// Note that this function must return explicitly false or true
	// Other falsy or truthy values are NOT okay to return (will throw exception)
	//////// SUGGESTIONS WHAT TO DO HERE //////////
	// 1) Remove player (turn is given to next player) or...
	// 2) Give turn back to current player or...
	// 3) Give turn to next player but keep current player in game.
	///////////////////////////////////////////////

}

/** 
* Handles moves from player. Both legal AND illegal.
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

}

/** 
* Handles untimely move from player. Untimely means it was NOT player's turn to move.
* @param {Object} world - The global game state.
* @param {Object} player - The player who made the move
* @param {Object} actions - Obj containing game actions
* @returns {Boolean} False === player removed from game, True === player remains in the game.
*/
function handleUntimelyMove(world, player, actions) {
	// Note that this function must return explicitly false or true
	// Other falsy or truthy values are NOT okay to return (will throw exception)
}


// Features to have

/*

1) Move timeout
2) Can skip move?
3) Hook-based system
4) Events (like 'moveMade')
5) Auto-end when just one player left
7) Actions and global state being passed to methods
8) Async world update?