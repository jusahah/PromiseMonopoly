var Promise = require('bluebird');
var _ = require('lodash');

// Actions
var EndGame = require('./actions/EndGame');

function Game(initialWorld, players, phases) {

	this.__world = initialWorld;
	this.__players = players;
	this.__phases = phases;

	this.start = function() {
		console.log("--- GAME STARTS ---");
		console.log("Players len: " + this.__players.length);
		return Promise.each(this.__phases, function(phase) {
			
			phase.__initialize(this.__world, this.__players);
			return phase.__start().tap(function() {
				
			})
		}.bind(this)).tap(function() {
			console.log("--- GAME ENDS ---");
		}).catch(EndGame, function() {
			console.log("Game ended by action call!");
		})
	}

}

module.exports = Game;