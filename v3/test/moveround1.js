var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');

var chai = require('chai');
var expect = chai.expect;

// Protos
var User = require('../User');
var Player = require('../Player');

// Domain objs
var whitePlayer = new Player(new User('white'))
var blackPlayer = new Player(new User('black'))
var redPlayer = new Player(new User('red'))
var greenPlayer = new Player(new User('green'))

var MoveRound = require('../MoveRound');
var Phase = require('../Phase');
var Game = require('../Game');

describe('Moveround communication to players', function() {
	describe('Make a move messages to 3 players (no loop)', function() {
		var moveCommands = [];
		it('Sends make a move correctly', function(done) {
			whitePlayer.move = function() {
				moveCommands.push('white');
				return Promise.resolve('e4');
			}
			blackPlayer.move = function() {
				moveCommands.push('black');
				return Promise.resolve('e4');
			}
			redPlayer.move = function() {
				moveCommands.push('red');
				return Promise.resolve('e4');
			}							
			var mw = new MoveRound({loop: false});
			mw.__initialize({}, [whitePlayer, blackPlayer, redPlayer]);
			mw.__start().then(function() {
				expect(moveCommands).to.deep.equal(['white', 'black', 'red']);
				done();
			})
		});
	});

	describe('Make a move messages to 3 players (loop thrice)', function() {
		var moveCommands = [];
		it('Sends make a move correctly', function(done) {
			whitePlayer.move = function() {
				moveCommands.push('white');
				return Promise.resolve('e4');
			}
			blackPlayer.move = function() {
				moveCommands.push('black');
				return Promise.resolve('e4');
			}
			redPlayer.move = function() {
				moveCommands.push('red');
				return Promise.resolve('e4');
			}							
			var mw = new MoveRound({loop: true});
			mw.handleLegalMove = function(move, globalState, player, actions) {
				globalState.roundNum++;
				console.log("Round num: " + globalState.roundNum);
				if (globalState.roundNum === 9) {
					actions.endMoveRound();
				}

				return true;
			}
			mw.__initialize({roundNum: 0}, [whitePlayer, blackPlayer, redPlayer]);
			mw.__start().then(function() {
				expect(moveCommands).to.deep.equal([
					'white', 
					'black', 
					'red',
					'white', 
					'black', 
					'red',
					'white', 
					'black', 
					'red',
				]);
				done();
			})
		});
	});

	describe('Make a move messages to 3 players (loop thrice) with 1 dropping out after 1st round, 2nd after 3rd round', function() {
		var moveCommands = [];
		it('Sends make a move correctly', function(done) {
			whitePlayer.move = function() {
				moveCommands.push('white');
				return Promise.resolve('e4');
			}
			blackPlayer.move = function() {
				moveCommands.push('black');
				return Promise.resolve('e4');
			}
			redPlayer.move = function() {
				moveCommands.push('red');
				return Promise.resolve('e4');
			}							
			var mw = new MoveRound({loop: true});
			mw.handleLegalMove = function(move, globalState, player, actions) {
				globalState[player.getID()]++;
				if (globalState[player.getID()] === 1 && player.getID() === 'black') {
					// Drop black player
					return false;
				} else if (globalState[player.getID()] === 3 && player.getID() === 'white') {
					// Drop white player
					return false;
				}

				return true;
			}

			mw.onExit = function(globalState) {
				console.log(_.pick(globalState, ['white', 'black', 'red']));
				expect(_.pick(globalState, ['white', 'black', 'red'])).to.deep.equal({
					white: 3,
					black: 1,
					red: 3
				});
			}

			mw.remainingPlayersAmountChanged = function(globalState, players, actions) {
				if (players.length <= 1) actions.endMoveRound();
			}

			mw.__initialize({white: 0, black: 0, red: 0}, [whitePlayer, blackPlayer, redPlayer]);
			mw.__start().then(function() {
				expect(moveCommands).to.deep.equal([
					'white', 
					'black', 
					'red',
					'white',  
					'red',
					'white', 
					'red',
				]);
				done();
			})
		});
	});

	describe('checkLegality function', function() {
		var handleMoveInvocations = [];
		it('should route calls to handleLegalMove and handleIllegalMove correctly', function(done) {
			whitePlayer.move = function() {
				return Promise.resolve('wm');
			}
			blackPlayer.move = function() {
				return Promise.resolve('bm');
			}
			redPlayer.move = function() {
				return Promise.resolve('rm');
			}	
			greenPlayer.move = function() {
				return Promise.resolve('gm');
			}	

			var mw = new MoveRound({loop: false});

			var p1 = new Phase('rounds', {loop: false}, [mw, mw, mw]);

			mw.handleLegalMove = function(move, globalState, player, actions) {
				handleMoveInvocations.push('legal');
				return true;
				
			}
			mw.handleIllegalMove = function(move, globalState, player, actions) {
				handleMoveInvocations.push('illegal');
				return false;
				
			}

			mw.checkMoveLegality = function(move) {
				return move === 'wm' || move === 'gm';
			}

			mw.remainingPlayersAmountChanged = function(globalState, players, actions) {
				if (players.length <= 1) actions.endMoveRound();
			}

			p1.__initialize({}, [whitePlayer, blackPlayer, redPlayer, greenPlayer]);
			p1.__start()
			.then(function() {
				expect(handleMoveInvocations).to.deep.equal([
					'legal',
					'illegal',
					'illegal',
					'legal',
					'legal',
					'illegal',
					'illegal',
					'legal',
					'legal',
					'illegal',
					'illegal',
					'legal'										
				]);
				done();
			})

		});
	});
})

