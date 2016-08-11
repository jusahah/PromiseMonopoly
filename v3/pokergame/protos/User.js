var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');

function User(id, msgForward) {

	/** Player unique identification */
	this.id = id;
	/** If set -> user is currently playing */
	this.player = null;

	this.pendingMoveResolve;

	this.setPlayer = function(player) {
		//console.log(this.id + " :setting player link to User");
		this.player = player;
	}

	this.beforeRegistration = function(registrationPreventAction) {
		//console.log("--- USER: beforeRegistration inGame? " + this.__inGame());
		if (this.__inGame()) {
			// Already playing
			console.log("--USER(" + this.id + ") already playing!");
			return registrationPreventAction();
		}

		return true;

	}

	this.move = function(msg) {
		this.msg({
			topic: 'yourTurn',
			timetomove: 10000
		});
		return new Promise(function(resolve, reject) {
			this.pendingMoveResolve = resolve;
		}.bind(this));

	}

	this.receiveMoveFromFrontend = function(move) {
		console.log("Sending move to Player object");
		console.log(move);
		
		if (this.pendingMoveResolve) {
			this.pendingMoveResolve(move);
			this.pendingMoveResolve = null;
		}
	}

	this.msg = msgForward || function(msg) {
	
		msg = JSON.stringify(msg);
		console.error("Should not call this - msgForward should overwrite this");
		
	}

	this.disconnect = function() {
		if (this.player) this.player.disconnect();
	}

	this.__inGame = function() {
		return !!this.player;
	}


}

module.exports = User;