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
					"1rbqkb1r/pppppppp/n6n/8/3PP3/5N2/PPP2PPP/RNBQKB1R w KQk - 3 4",
					"1rbqkb1r/pppppppp/n6n/8/3PP3/5N2/PPP2PPP/RNBQKB1R w KQk - 3 4" 
				])
				done();
			})
		});
	});

});

describe('Chess test 2', function() {
	describe('Play a short game to quick mate', function() {
		// Build the world 
		var whiteUser = new User('white')
		var blackUser = new User('black')

		var whiteMoveList = [
			{
				move: 'e4',
				time: 20
			},
			{
				move: 'e2', // Illegal, should retry
				time: 20
			},
			{
				move: 'd4',
				time: 50
			},
			{
				move: 'Qh5', // Mate
				time: 40
			}
					

		]

		var blackMoveList = [
			{
				move: 'f6', 
				time: 20
			},
			{
				move: 'g5', 
				time: 20
			}
			,
			{
				move: 'a6', 
				time: 20
			}		
		]

		var movePair = new MoveRound({loop: true});
		var chessGame = new Game({game: new Chess()}, [movePair]);

		var broadcasts = [];
		var moveCommands = [];

		// Extend/overwrite original methods

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
			if (globalState.game.game_over()) {
				actions.endGame();
			}
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

		it('Should play a game to mate', function(done) {

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
					'black', 
					'white', // Illegal, retry
					'white',
					'black',
					'white' // Mate
				]);
				// Should be 1. e4 Na6 2. d4 Rb8 3. Nf3 Nh6
				expect(broadcasts).to.deep.equal([
					"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
					"rnbqkbnr/ppppp1pp/5p2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
					"rnbqkbnr/ppppp1pp/5p2/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
					"rnbqkbnr/ppppp2p/5p2/6p1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq g6 0 3",
					"rnbqkbnr/ppppp2p/5p2/6pQ/3PP3/8/PPP2PPP/RNB1KBNR b KQkq - 1 3"
					])
				done();
			})
		});
	});

});

describe('Draw-a-card test', function() {

	it('A should win twice, B once, C none', function(done) {

		var rounds = {

			A: [1,2,3],
			B: [3,0,0],
			C: [2,1,2]

		};

		var AUser = new User('A')
		var BUser = new User('B')
		var CUser = new User('C')

		var oneRound = new MoveRound({loop: false});

		var globalStateObj = {
			wins: {
				A: 0, 
				B: 0, 
				C: 0
			},
			current: {}
		};
		var bestOfThree = new Game(globalStateObj, [oneRound, oneRound, oneRound]);

		var broadcasts = [];
		var moveCommands = [];

		oneRound.handleLegalMove = function(move, globalState, player, actions) {
			globalState.current[player.getID()] = move;
			return true;
		}

		oneRound.broadcastNewWorld = function(globalState) {
			broadcasts.push(_.assign({}, globalState.wins));
			return _.assign({}, globalState.wins)
		}	

		oneRound.beforeLoopRound = function(globalState, players) {
			console.log(globalState.wins);
			globalState.current = {};
		}	

		oneRound.afterLoopRound = function(globalState, _remainingPlayers) {
			console.log(globalState)
			var nameValuePairs = _.toPairs(globalState.current);
			console.log(nameValuePairs)

			var sorted = _.sortBy(nameValuePairs, function(nameValueArr) {
				return (-1) * nameValueArr[1];
			});

			globalState.wins[sorted[0][0]]++;	

			console.log(globalState.wins);
		}

		bestOfThree.register(AUser)
		.then(function() {
			bestOfThree.register(BUser);
		})
		.then(function() {
			bestOfThree.register(CUser);
		})
		.then(function() {
			// Extends after-hand the Player objects of Users
			var APlayer = AUser.player;
			var BPlayer = BUser.player;
			var CPlayer = CUser.player;

			APlayer.move = function() {
				console.log("---- A MOVE---");
				moveCommands.push('A');

				return Promise.delay(10).return(rounds['A'].shift());
			}
			BPlayer.move = function() {
				console.log("--- B MOVE----")
				moveCommands.push('B');
	
				return Promise.delay(10).return(rounds['B'].shift());
			}
			CPlayer.move = function() {
				console.log("--- C MOVE----")
				moveCommands.push('C');
	
				return Promise.delay(10).return(rounds['C'].shift());
			}
			return true;
		})		
		.then(function() {
			return bestOfThree.start();
		})
		.then(function() {
			expect(globalStateObj.wins).to.deep.equal({
				A: 2,
				B: 1,
				C: 0
			});
			done();
		})			


	})
})