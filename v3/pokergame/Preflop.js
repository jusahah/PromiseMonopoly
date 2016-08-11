var Promise = require('bluebird');
var _ = require('lodash');

var Phase = require('../Phase');



function Preflop(settings, phases) {

	Phase.call(this, 'Preflop', settings, phases);


}

// Set prototype link
Preflop.prototype = Object.create(Phase.prototype);


module.exports = Preflop;