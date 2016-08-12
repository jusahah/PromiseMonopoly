var Promise = require('bluebird');
var _ = require('lodash');

var Phase = require('./protos/Phase');

function Flop(settings, phases) {

	Phase.call(this, 'Flop', settings, phases);

	this.onEnter = function(globalState, players) {
		console.error("--FLOP ENTER--")

		globalState.currentHand.boardCards = _.pullAt(globalState.currentHand.deck, [0,1,2]);

		this.__broadcast({
			topic: 'boardcards_changed',
			msg: globalState.currentHand.boardCards
		})
	}



}

// Set prototype link
Flop.prototype = Object.create(Phase.prototype);


module.exports = Flop;