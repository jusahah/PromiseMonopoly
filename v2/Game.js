var Promise = require('bluebird');
var _ = require('lodash');

// Actions
var EndGame = require('./actions/EndGame');

// RegistrationActions
var RegistrationPrevent = require('./actions/RegistrationPrevent');
var RegisterAndStartGameAction = require('./actions/RegisterAndStartGameAction');

function Game(initialWorld, phases) {

	this.id = 'abc_' + Math.floor(Math.random() * 100000000);
	this.__world = initialWorld;
	this.__players = [];
	this.__phases = phases;

	this.__registrationClosed = false;

	this.start = function() {
		console.log("--- GAME STARTS ---");
		console.log("Players len: " + this.__players.length);
		console.log("World in Game: " + initialWorld.gamesPlayed);
		return Promise.each(this.__phases, function(phase) {
			console.log("World in Phase loop: " + this.__world.gamesPlayed);
			phase.__initialize(this.__world, this.__players);
			return phase.__start().tap(function() {
				
			})
		}.bind(this)).tap(function() {
			console.log("--- GAME ENDS ---");
		}).catch(EndGame, function() {
			console.log("Game ended by action call!");
		})
	}

	this.addPlayer = function(player) {
		// Call game beforeRegistration extended method
		// Provide extended method a way to abort registration through raising an exception 



		return Promise.try(function() {

			if (this.__registrationClosed) {
				// Already closed
				throw new RegistrationPrevent();
			}

			this.beforeRegistration(
				player, 
				_.slice(this.__players), 
				/* We pass in actions the hook can trigger! */
				function() {
					throw new RegistrationPrevent();
				},
				function() {
					this.__registrationClosed = true;
					throw new RegisterAndStartGameAction();
				}.bind(this)
			);
			player.beforeRegistration(new RegistrationPrevent());
			// If neither raised an exception, add the player in!
			this.__players.push(player);
			return true;
		}.bind(this))
		.catch(RegistrationPrevent, function(err) {
			console.log("---Registration prevented!---");
			player.msg({
				topic: 'registration_prevent',
				gameID: this.id
			})
			return null;
		}.bind(this))
		.catch(RegisterAndStartGameAction, function() {
			console.log("REGISTER AND START");
			this.__players.push(player);
			this.start();
			return true;
		}.bind(this));
		
		// Call User's beforeRegistration hook
		// Provide User way to abort registration through raising an exception 
		
		
	}

	this.broadcast = function(msg) {
		_.map(this.__players, function(player) {
			player.msg(msg);
		}.bind(this))
	}

}

module.exports = Game;