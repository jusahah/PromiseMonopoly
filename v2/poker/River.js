var Promise = require('bluebird');
var _ = require('lodash');

var GamePhase = require('../GamePhase');

function River(settings, phases) {

	GamePhase.call(this, 'River', settings, phases);

}

// Set prototype link
River.prototype = Object.create(GamePhase.prototype);


module.exports = River;