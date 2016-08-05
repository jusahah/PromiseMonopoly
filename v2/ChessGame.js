var Promise = require('bluebird');
var _ = require('lodash');

var GamePhase = require('./GamePhase');

function ChessGame(settings, phases) {

	GamePhase.call(this, 'ChessGame', phases);
}

// Set prototype link
ChessGame.prototype = Object.create(GamePhase.prototype);


module.exports = ChessGame;