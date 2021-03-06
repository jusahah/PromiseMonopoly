var Promise = require('bluebird');
var _ = require('lodash');

var Phase = require('./protos/Phase');

var CARDS = [
	['Ah', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh'],
	['As', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks'],
	['Ac', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc'],
	['Ad', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd']
];

function Hand(initialWorld, phases) {

	Phase.call(this, 'Hand', initialWorld, phases);

	this.onEnter = function(globalState, players) {
		console.error("Hand on enter (onEnter)");
		console.log(players.length);
		// Deal cards to each players!
		globalState.currentHand.deck = _.shuffle(_.flatten(CARDS));
		globalState.currentHand.holeCards = {};

		var playersByID = _.keyBy(players, function(player) {
			return player.getID();
		});
		
		// Deal two cards to each player
		_.mapValues(playersByID, function(player) {
			var holeCards = _.pullAt(globalState.currentHand.deck, [0,1]);
			globalState.currentHand.holeCards[player.getID()] = holeCards
			player.msg({
				topic: 'your_hole_cards',
				msg: holeCards
			})
		});

	}

	this.onExit = function() {
		console.log("Hand on exit");

	}


}

// Set prototype link
Hand.prototype = Object.create(Phase.prototype);


module.exports = Hand;