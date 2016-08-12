var Promise = require('bluebird');
var _ = require('lodash');

var MoveRound = require('./protos/MoveRound');

function BettingRound(settings, phases) {

	MoveRound.call(this, 'BettingRound', settings, phases);

	this.onEnter = function(globalState, players) {
		console.warn("BettingRound enter");

	}

	this.onExit = function(globalState) {
		var tableBets = globalState.currentHand.betsOnTable;

		// Gather bets
		var totalBetSum = _.chain(tableBets)
		.values()
		.reduce(function(sum, bet) {
			return sum + bet;
		}, 0)
		.value();

		// Add collected bets to current pot
		globalState.currentHand.pot += totalBetSum;

		// Reset bets on table
		globalState.currentHand.betsOnTable = _.mapValues(tableBets, function() {
			return 0;
		});
	}

	this.checkMoveLegality = function(moveObj, globalState, player, actions) {
		console.log("Move legality checkup: " + moveObj.move);
		var playerID = player.getID();
		var move = moveObj.move;
		if (move === 'fold') return true;
		if (move === 'check') {
			if (this.findCallAmount(globalState.currentHand.betsOnTable, playerID) < 0.001) {
				return true;
			}
			return false;
		}

		if (move === 'bet') return true;
		if (move === 'call') {
			if (this.findCallAmount(globalState.currentHand.betsOnTable, playerID) < 0.001) {
				return false; // Nothing to call
			}
			return true;			
		}

	}

	this.handleLegalMove = function(moveObj, globalState, player, actions) {
		var move = moveObj.move;
		console.log("Handling legal move: " + move);
		var playerID = player.getID();
		if (move === 'fold') {
			var holeCards = globalState.currentHand.holeCards;
			
			// Muck the player hole cards, indicating he is out of the hand
			_.unset(globalState.currentHand.holeCards, playerID);
			return false; // Drop the player from this hand
		}
		if (move === 'check') return true;
		if (move === 'bet') {
			var bet = 50;
			globalState.chips[playerID] -= bet;
			globalState.currentHand.betsOnTable[playerID] += bet;
			return true;
		}
		if (move === 'call') {
			var call = this.findCallAmount(globalState.currentHand.betsOnTable, playerID);
			globalState.chips[playerID] -= call;
			globalState.currentHand.betsOnTable[playerID] += call;
			return true;
		}
		throw new Error("Unknown move in handleLegalMove: " + move);
		

	} 

	this.handleIllegalMove = function(move, globalState, player, actions) {
		return actions.retryTurn();
	}

	this.findCallAmount = function(betsOnTable, playerID) {
		var myBets = betsOnTable[playerID];

		var highestBets = _.chain(betsOnTable)
		.toPairs()
		.sortBy(function(playerBetsArr) {
			return playerBetsArr[1];
		})
		.head()
		.value();
		console.log("Find call amount through-------")
		return highestBets - myBets;

	}

	this.broadcastNewWorld = function(globalState) {

		console.warn("---- STATE -------");
		console.log(JSON.stringify(globalState));
		console.warn("------------------");
		return {
			pot: globalState.currentHand.pot,
			bets: globalState.currentHand.betsOnTable
		}

	}

	this.beforeMove = function(globalState, player, retryCount, actions) {
		console.warn("------------- BEFORE MOVE FILTER----------")
		if (!_.has(globalState.currentHand.holeCards, player.getID())) {
			console.error("BEFORE MOVE: Player not anymore playing a hand");
			actions.skipMove();
		}

		return true;

	}

	this.afterMove = function(globalState, retryCount, actions) {
		console.error("AFTER BETTING ROUND MOVE")
		this.__broadcast({
			topic: 'table_state_after_move',
			msg: {
				pot: globalState.currentHand.pot,
				bets: globalState.currentHand.betsOnTable
			}
		});
		// Check if there is any point of going on
		var holeCards = globalState.currentHand.holeCards;

		if (_.keys(holeCards).length === 1) {
			console.warn("END MOVE ROUND");
			//return actions.endMoveRound();
		}


	}




}

// Set prototype link
BettingRound.prototype = Object.create(MoveRound.prototype);


module.exports = BettingRound;