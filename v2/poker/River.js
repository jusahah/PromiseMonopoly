var Promise = require('bluebird');
var _ = require('lodash');

var GamePhase = require('../GamePhase');

function River(settings, phases) {

	GamePhase.call(this, 'River', settings, phases);

	this.initializeLocalWorld = function(parentWorld, players) {
		parentWorld.table.boardCards.push(_.sampleSize(parentWorld.table.deck, 1));
		parentWorld.table.boardCards = _.flatten(parentWorld.table.boardCards);
		return parentWorld;
	}

}

// Set prototype link
River.prototype = Object.create(GamePhase.prototype);


module.exports = River;