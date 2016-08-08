var Promise = require('bluebird');
var _ = require('lodash');

var MoveRound = require('../MoveRound');

function BettingRound(settings, phases) {

	MoveRound.call(this, 'BettingRound', settings, phases);

	this.initializeLocalWorld = function(parentWorld, players) {
		var playersByID = _.keyBy(players, function(player) {
			return player.getID();
		});

		return _.mapValues(playersByID, function(player) {
			return {betsInFront: 0}
		});
	}


}

// Set prototype link
BettingRound.prototype = Object.create(MoveRound.prototype);


module.exports = BettingRound;