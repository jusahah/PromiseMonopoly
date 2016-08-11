var Promise = require('bluebird');
var _ = require('lodash');

var Phase = require('../Phase');

function Flop(settings, phases) {

	Phase.call(this, 'Flop', settings, phases);



}

// Set prototype link
Flop.prototype = Object.create(Phase.prototype);


module.exports = Flop;