var chalk = require('chalk');

function User(id) {
	/** Player unique identification */
	this.id = id;
	/** If set -> user is currently playing */
	this.player = null;

	this.setPlayerLink = function(player) {
		this.player = player;
	}

	this.beforeRegistration = function(registrationPreventException) {
		if (this.player) {
			// Already playing
			throw registrationPreventException;
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


}

module.exports = User;