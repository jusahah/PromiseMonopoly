var Promise = require('bluebird');
var _ = require('lodash');

var GamePhase = require('../GamePhase');

function Turn(settings, phases) {

	GamePhase.call(this, 'Turn', settings, phases);

}

// Set prototype link
Turn.prototype = Object.create(GamePhase.prototype);


module.exports = Turn;