var Promise = require('bluebird');
var _ = require('lodash');

var GamePhase = require('../GamePhase');

function Flop(settings, phases) {

	GamePhase.call(this, 'Flop', settings, phases);

	this.initializeLocalWorld = function(parentWorld, players) {
		parentWorld.table.boardCards.push(_.sampleSize(parentWorld.table.deck, 3));
		parentWorld.table.boardCards = _.flatten(parentWorld.table.boardCards);
		return parentWorld;

	}

	this.broadcastNewWorld = function(localWorld) {
		/*
		localWorld.table.boardCards.push(_.sampleSize(localWorld.table.deck, 3));
		localWorld.table.boardCards = _.flatten(localWorld.table.boardCards);
		*/
		return localWorld;
	}

}

// Set prototype link
Flop.prototype = Object.create(GamePhase.prototype);


module.exports = Flop;