var Promise = require('bluebird');
var _ = require('lodash');

var fixedTime = 1000;
var variableTime = 200;

function Player(user) {

	this.user = user;
	/** Set link from User to this Player obj */
	this.user.setPlayer(this);

	this.game = null;

	this.move = function(moveInfo) {
		// From here we route to User with gameID attached!
		if (this.user && this.game) {
			this.user.msg({
				topic: 'yourMove',
				gameID: this.game.__getID(),
			});
		}
		//this.msg({topic: 'yourMove'});
		return Promise.delay(fixedTime + Math.random() * variableTime).then(function() {
			// Get random move out of moveInfo which contains array of legal moves
			var randomMove = _.sample(moveInfo);
			console.log("Random move: " + randomMove);
			return randomMove;
		})		
	}

	this.__setGame = function(game) {
		this.game = game;
	}

	this.msg = function(msg) {
		// From here we route to User with gameID attached!
		if (this.user) {
			// Decorate with game id
			if (this.game) msg.gameID = this.game.__getID();
			this.user.msg(msg);
		}		

	}

	this.getID = function() {
		return this.user.id;
	}

}

module.exports = Player;