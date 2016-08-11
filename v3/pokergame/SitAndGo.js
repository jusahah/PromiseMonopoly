var Promise = require('bluebird');
var _ = require('lodash');

var Game = require('../Game');

function SitAndGo(initialWorld, phases) {

	Game.call(this, initialWorld, phases);

 	this.beforeRegistration = function(
		user, 
		players, 
		registrationPreventAction, 
		registerAndStartGameAction
	) {
		console.log("Players currently: " + players.length);
		console.log("Registering user to game: " + user.id);
		return true;
	
	}
}

// Set prototype link
SitAndGo.prototype = Object.create(Game.prototype);


module.exports = SitAndGo;