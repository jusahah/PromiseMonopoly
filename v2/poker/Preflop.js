var Promise = require('bluebird');
var _ = require('lodash');

var GamePhase = require('../GamePhase');



function Preflop(settings, phases) {

	GamePhase.call(this, 'Preflop', settings, phases);


}

// Set prototype link
Preflop.prototype = Object.create(GamePhase.prototype);


module.exports = Preflop;