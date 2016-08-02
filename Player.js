var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function Player(id, settings) {

	/** Link to Game object. Null if player not registered to any Game */
	this.gameLink = null;

	this.maxTime = settings.maxTime || 60 * 1000;

	this.id = id;

	this.cbs = {
		disconnect: null,
	}

	this.hasDisconnected = false;
	
	this.disconnect = function() {
		if (this.cbs.disconnect) return this.cbs.disconnect();
		console.log("WARNING: Player disconnected but no cb present!");
	}

	this.setDisconnectNotify = function(cb) {
		this.cbs.disconnect = cb;
	}

	this.yourMove = function() {
		return Promise.delay(Math.random()*this.maxTime).then(function() {
			return {timeout: false, move: 'e4'};
		})
	}

	this.customMsg = function(msg) {
		console.log("---Received msg in player: " + this.id + " ------");
		console.log(msg);
	}

	// Testing disconnecting!
	if (this.id === 'B4') {
		console.log("Test disconnect");
		setTimeout(function() {
			this.disconnect();
		}.bind(this), 4500);		
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