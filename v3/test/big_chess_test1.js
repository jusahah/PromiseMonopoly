var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');

var chai = require('chai');
var expect = chai.expect;

// Protos
var User = require('../User');
var Player = require('../Player');

// Domain objs
var whiteUser = new User('white')
var blackUser = new User('black')

var Chess = require('chess.js').Chess;

var MoveRound = require('../MoveRound');
var Phase = require('../Phase');
var Game = require('../Game');

// Game goes: 1. e4 Na6 2. d4 Rb8 3. Nf3 Nh6

var whiteMoveList = [
	{
		move: 'e4',
		time: 20
	},
	{
		move: 'e4', // Illegal, should retry
		time: 20
	},
	{
		move: 'd4',
		time: 50
	},
	{
		move: 'Nf3', 
		time: 40
	},
	{
		move: 'Nc3', // Too slow, loses game
		time: 500
	},
	{
		move: 'Rb1', 
		time: 20
	}			

]

var blackMoveList = [
	{
		move: 'c3', // Illegal, should retry
		time: 20
	},
	{
		move: 'Qe8', // Illegal, should retry
		time: 20
	},
	{
		move: 'Na6', 
		time: 40
	},
	{
		move: 'Rb8', 
		time: 10
	},
	{
		move: 'Nh6', 
		time: 10
	},
	{
		move: 'd6',
		time: 40
	},				
	{
		move: 'c6',
		time: 40
	},	
	{
		move: 'Ng8',
		time: 40
	},		
]

var movePair = new MoveRound({loop: true});
var chessGame = new Game({game: new Chess()}, [movePair]);

var broadcasts = [];
var moveCommands = [];

// Start extending

movePair.checkMoveLegality = function(move, globalState, player, actions) {
	var chess = globalState.game;
	if (chess.move(move)) {
		chess.undo();
		return true;
	}
	return false;
}

movePair.handleIllegalMove = function(move, globalState, player, actions) {	
	actions.retryTurn(); // Make player move again
} 

movePair.handleLegalMove = function(move, globalState, player, actions) {
	globalState.game.move(move);
	return true;
}

movePair.handleTimeout = function(globalState, player, actions) {
	actions.endGame();

}

movePair.broadcastNewWorld = function(globalState) {
	broadcasts.push(globalState.game.fen());
	return globalState.game.fen();
}

movePair.remainingPlayersAmountChanged = function(globalState, players, actions) {
	console.log("-.-- remainingPlayersAmountChanged")
	if (players.length <= 1) actions.endGame();
}

describe('Chess test', function() {
	describe('Play a short game containing illegals and timeouts', function() {
		it('Should produce correct sequence of broadcasts and moveCommands', function(done) {


						
			chessGame.register(whiteUser)
			.then(function() {
				chessGame.register(blackUser);
			})
			.then(function() {
				// Extends after-hand the Player objects of Users
				var whitePlayer = whiteUser.player;
				var blackPlayer = blackUser.player;

				whitePlayer.move = function() {
					console.log("---- WHITE MOVE---");
					moveCommands.push('white');
					var moveObj = whiteMoveList.shift();
					return Promise.delay(moveObj.time).return(moveObj.move);
				}
				blackPlayer.move = function() {
					console.log("--- BLACK MOVE----")
					moveCommands.push('black');
					var moveObj = blackMoveList.shift();
					return Promise.delay(moveObj.time).return(moveObj.move);
				}

				return true;
			})
			.then(function() {
				return chessGame.start();
			})
			.then(function() {
				console.log("CHECK EXPECT");
				console.log(JSON.stringify(broadcasts))
				expect(moveCommands).to.deep.equal([
					'white',
					'black', // Illegal, retry
					'black', // Illegal, retry
					'black',
					'white', // Illegal, retry
					'white',
					'black',
					'white',
					'black',
					'white' // Timeout
				]);
				// Should be 1. e4 Na6 2. d4 Rb8 3. Nf3 Nh6
				expect(broadcasts).to.deep.equal([
					"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
					"r1bqkbnr/pppppppp/n7/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2",
					"r1bqkbnr/pppppppp/n7/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
					"1rbqkbnr/pppppppp/n7/8/3PP3/8/PPP2PPP/RNBQKBNR w KQk - 1 3",
					"1rbqkbnr/pppppppp/n7/8/3PP3/5N2/PPP2PPP/RNBQKB1R b KQk - 2 3",
					"1rbqkb1r/pppppppp/n6n/8/3PP3/5N2/PPP2PPP/RNBQKB1R w KQk - 3 4"
				])
				done();
			})
		});
	});

});