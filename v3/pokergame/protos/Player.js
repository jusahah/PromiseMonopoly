var Promise = require('bluebird');
var _ = require('lodash');

var fixedTime = 5000;
var variableTime = 200;

function Player(user) {

	this.user = user;
	/** Set link from User to this Player obj */
	this.user.setPlayer(this);

	this.game = null;

	this.__hasDisconnected = false;

	this.move = function(moveInfo) {
		// From here we route to User with gameID attached!
		if (this.user && this.game) {
			console.warn("Routing move request to user");
			var prom = this.user.move({
				gameID: this.game.__getID(),
			});
			console.log(prom);
			return prom;
		}
		console.error("Rejecting this.move in Player");
		return Promise.reject('No game or user link in Player object');
			
	}

	this.__setGame = function(game) {
		this.game = game;
	}

	this.disconnect = function() {
		this.__hasDisconnected = true;
		console.log("Player disconnect: " + this.__hasDisconnected);
		if (this.game) this.game.__playerDisconnected(this);
	}

	this.hasDisconnected = function() {
		//console.log("hasDisconnected? " + this.getID() + ": " + this.__hasDisconnected);
		return this.__hasDisconnected;
	}

	this.msg = function(msg) {
		// From here we route to User with gameID attached!
		if (this.user) {
			// Decorate with game id
			if (this.game) msg.gameID = this.game.__getID();
			console.error("MSG TO PLAYER: " + this.getID() + ", " + msg.topic)
			this.user.msg(msg);
		}		

	}

	this.getID = function() {
		return this.user.id;
	}

}

module.exports = Player;