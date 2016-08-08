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
		if (this.id === 'white') {
			console.log(chalk.black.bgWhite(msg));
		}
		else if (this.id === 'black') {
			console.log(chalk.bgBlack(msg));
		} 
		else if (this.id === 'red') {
			console.log(chalk.red.bgYellow(msg));
		}
	}

	this.__inGame = function() {
		return !!this.player;
	}


}

module.exports = User;