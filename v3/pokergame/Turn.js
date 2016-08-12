var Promise = require('bluebird');
var _ = require('lodash');

var Phase = require('./protos/Phase');

function Turn(settings, phases) {

	Phase.call(this, 'Turn', settings, phases);

	this.onEnter = function(globalState, players) {
		console.error("--TURN ENTER--")
		var turnCard = _.pullAt(globalState.currentHand.deck, [0])[0];
		globalState.currentHand.boardCards.push(turnCard);

		this.__broadcast({
			topic: 'boardcards_changed',
			msg: globalState.currentHand.boardCards
		})		
	}
}

// Set prototype link
Turn.prototype = Object.create(Phase.prototype);


module.exports = Turn;