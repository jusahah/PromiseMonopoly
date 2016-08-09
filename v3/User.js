var chalk = require('chalk');

function User(id) {
	/** Player unique identification */
	this.id = id;
	/** If set -> user is currently playing */
	this.player = null;

	this.setPlayer = function(player) {
		console.log(this.id + " :setting player link to User");
		this.player = player;
	}

	this.beforeRegistration = function(registrationPreventAction) {
		console.log("--- USER: beforeRegistration inGame? " + this.__inGame());
		if (this.__inGame()) {
			// Already playing
			console.log("--USER(" + this.id + ") already playing!");
			return registrationPreventAction();
		}

		return true;

	}

	this.msg = function(msg) {
		msg = JSON.stringify(msg);
		if (this.id === 'white' || this.id === 'p1') {
			console.log(chalk.black.bgWhite(msg));
		}
		else if (this.id === 'black' || this.id === 'p2') {
			console.log(chalk.bgBlack(msg));
		} 
		else if (this.id === 'red' || this.id === 'p3') {
			console.log(chalk.red.bgYellow(msg));
		}
		else if (this.id === 'green' || this.id === 'p4') {
			console.log(chalk.white.bgGreen(msg));
		}
	}

	this.__inGame = function() {
		return !!this.player;
	}


}

module.exports = User;