var Promise = require('bluebird');
var _ = require('lodash');

var MoveRound = require('../MoveRound');

function BettingRound(settings, phases) {

	MoveRound.call(this, 'BettingRound', settings, phases);




}

// Set prototype link
BettingRound.prototype = Object.create(MoveRound.prototype);


module.exports = BettingRound;