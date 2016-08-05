var Promise = require('bluebird');

var fixedTime = 1000;
var variableTime = 200;

function Player(id) {

	this.move = function() {
		console.log("Player " + id + " asked to move");
		return Promise.delay(fixedTime + Math.random() * variableTime).then(function() {
			return {timeout: false, move: 'e4'};
		})
		
	}


}

module.exports = Player;