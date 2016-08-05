var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');

var fixedTime = 1000;
var variableTime = 200;

function Player(id) {

	this.id = id;

	this.move = function(moveInfo) {
		this.msg({topic: 'yourMove'});
		return Promise.delay(fixedTime + Math.random() * variableTime).then(function() {
			// Get random move out of moveInfo which contains array of legal moves
			var randomMove = _.sample(moveInfo);
			console.log("Random move: " + randomMove);
			return randomMove;
		})		
	}

	this.msg = function(msg) {
		msg = JSON.stringify(msg);
		msg = this.id === 'white' ? chalk.black.bgWhite(msg) : chalk.bgBlack(msg);
		console.log(msg);
	}


}

module.exports = Player;