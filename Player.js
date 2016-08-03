var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function Player(id, settings, msgForward) {

	/** Link to Game object. Null if player not registered to any Game */
	this.gameLink = null;

	this.maxTime = settings.maxTime || 0.1 * 1000;

	this.id = id;

	this.cbs = {
		disconnect: null,
	}

	this.hasDisconnected = false;
	
	this.disconnect = function() {
		if (this.gameLink) {
			this.hasDisconnected = true;
			this.gameLink.playerDisconnecting(this);
			return;
		}
		/*
		if (this.cbs.disconnect) return this.cbs.disconnect();
		console.log("WARNING: Player disconnected but no cb present!");
		*/
	}
	/** Not in use for now */
	this.setDisconnectNotify = function(cb) {
		this.cbs.disconnect = cb;
	}

	this.yourMove = function() {
		this.customMsg({
			topic: 'yourTurn'
		});
		return Promise.delay(this.maxTime + Math.random() * 1500).then(function() {
			return {timeout: false, move: 'e4'};
		})
	}

	this.customMsg = msgForward || function(msg) {
		// Default test messaging forward
		console.log("---Received msg in player: " + this.id + " ------");
		console.log(msg);
	}

	// Testing disconnecting!
	if (this.id === 'B2') {
		console.log("Test disconnect");
		setTimeout(function() {
			this.disconnect();
		}.bind(this), 5500);		
	}

	this.linkToGame = function(game) {
		if (this.gameLink) throw new Error("Game link exists - can not overwrite, delete old first!");
		this.gameLink = game;
	}

	this.unlinkFromGame = function(game) {
		if (!this.gameLink) throw new Error ("Game link does NOT exist - can not unlink!");
		this.gameLink = null;
	}


 }