var Promise = require('bluebird');
var _ = require('lodash');

var Game = require('./Game');

function ChessMatch(initialWorld, players, phases) {

	Game.call(this, initialWorld, players, phases);
}

// Set prototype link
ChessMatch.prototype = Object.create(Game.prototype);


module.exports = ChessMatch;