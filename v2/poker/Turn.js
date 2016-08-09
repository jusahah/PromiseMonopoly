var Promise = require('bluebird');
var _ = require('lodash');

var GamePhase = require('../GamePhase');

function Turn(settings, phases) {

	GamePhase.call(this, 'Turn', settings, phases);

	this.initializeLocalWorld = function(parentWorld, players) {
		parentWorld.table.boardCards.push(_.sampleSize(parentWorld.table.deck, 1));
		parentWorld.table.boardCards = _.flatten(parentWorld.table.boardCards);
		return parentWorld;
	}
}

// Set prototype link
Turn.prototype = Object.create(GamePhase.prototype);


module.exports = Turn;