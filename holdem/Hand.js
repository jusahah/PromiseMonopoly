var Promise = require('bluebird');
var _ = require('lodash');

var Phase = require('./protos/Phase');
var Move  = require('./protos/Move');

module.exports = function() {

	return {

		initialize: function(world, actions) {

			// Initialize deck for the hand
			world.deck = new Deck();
			// Deal every remaining player a hand
			return Promise.each(world.remainingPlayers, function(player) {
				var cards = world.deck.drawCards(2); // Mutates world's deck
				player.customMsg({
					topic: 'yourHoleCards',
					cards: cards
				})
			}).delay(1500); // Give time for client animation
		},

		start: function() {

		}

		passToChild: function() {

		},

		destroy: function(world, actions) {
			world.deck = null;
		}
	}
}


function Deck() {

	this.CARDS = [
		['Ah', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh'],
		['As', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks'],
		['Ac', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc'],
		['Ad', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd']
	];

	this.state = _.shuffle(_.flatten(this.CARDS));

	this.drawCards = function(amount) {
		return _.remove(this.state, function(card, idx) {
			return idx < amount;
		})
	}


}


/*

/////// TEXAS HOLDEM /////////

SitAndGo.initialize
--Hand.initialize
----Preflop.initialize
------MoveRound
----Preflop.destroy
----Flop.initialize
------MoveRound
----Flop.destroy
----Turn.initialize
------MoveRound
----Turn.destroy
----River.initialize
------MoveRound
----River.destroy
--Hand.destroy

--Hand.initialize
...

SitAndGo.destroy

*/

/*
/////// CHESS //////////

ChessGame.initialize
--MoveRound.initialize
----MakeMove
--MoveRound.destroy
ChessGame.destroy

*/

/*
/////// Civilization 2 //////////

CivGame.initialize
--MoveRound
CivGame.destroy

*/

/*
/////// Carcassonne //////////

Carcassonne.initialize
--MoveRound
----PlaceTile
----PlaceFollowers
Carcassonne.destroy

*/

