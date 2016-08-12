var Promise = require('bluebird');
var _ = require('lodash');

var Phase = require('./protos/Phase');



function Preflop(settings, phases) {

	Phase.call(this, 'Preflop', settings, phases);

	this.onEnter = function() {
		console.error("--PREFLOP ENTER--")
	}
}

// Set prototype link
Preflop.prototype = Object.create(Phase.prototype);


module.exports = Preflop;