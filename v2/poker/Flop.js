var Promise = require('bluebird');
var _ = require('lodash');

var GamePhase = require('../GamePhase');

function Flop(settings, phases) {

	GamePhase.call(this, 'Flop', settings, phases);

}

// Set prototype link
Flop.prototype = Object.create(GamePhase.prototype);


module.exports = Flop;