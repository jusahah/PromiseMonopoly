var Promise = require('bluebird');
var _ = require('lodash');

var Phase = require('../Phase');

function Turn(settings, phases) {

	Phase.call(this, 'Turn', settings, phases);

}

// Set prototype link
Turn.prototype = Object.create(Phase.prototype);


module.exports = Turn;