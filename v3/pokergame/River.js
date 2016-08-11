var Promise = require('bluebird');
var _ = require('lodash');

var Phase = require('../Phase');

function River(settings, phases) {

	Phase.call(this, 'River', settings, phases);



}

// Set prototype link
River.prototype = Object.create(Phase.prototype);


module.exports = River;