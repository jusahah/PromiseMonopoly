var Promise = require('bluebird');
var _ = require('lodash');

var Phase = require('./protos/Phase');

function River(settings, phases) {

	Phase.call(this, 'River', settings, phases);

	this.onEnter = function(globalState, players) {
		console.error("--RIVER ENTER--")
		var riverCard = _.pullAt(globalState.currentHand.deck, [0])[0];
		globalState.currentHand.boardCards.push(riverCard);

		this.__broadcast({
			topic: 'boardcards_changed',
			msg: globalState.currentHand.boardCards
		})	
	}

}

// Set prototype link
River.prototype = Object.create(Phase.prototype);


module.exports = River;