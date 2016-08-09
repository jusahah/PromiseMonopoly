var chalk = require('chalk');
var _ = require('lodash');

var currLevel = 0;

module.exports = {

	push: function() {
		currLevel++;
	},
	pop: function() {
		currLevel--;
	},

	log: function(msg) {
		console.log(_.repeat('-', currLevel) + chalk.white.bgBlue(msg));
	},
	log2: function(msg) {
		console.log(_.repeat('-', currLevel) + chalk.white.bgYellow(msg));
	}


}