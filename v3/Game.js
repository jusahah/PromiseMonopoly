var Promise = require('bluebird');
var _ = require('lodash');
var recursiveLog = require('./recursiveLog');
// Domain objs
var Player = require('./Player');

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

	// We should later abstract these into State pattern or smth
	this.__registrationClosed = false;
	this.__gameEnded = false;

	this.start = function() {
		recursiveLog.log('START: Game');

		// Run through separate initialization function
		//this.__world = this.initializeLocalWorld(this.__world, this.__players);

		return Promise.each(this.__phases, function(phase) {
			phase.__initialize(this.__world, this.__players);
			return phase.__start().tap(function() {
				
			})
		}.bind(this)).tap(function() {

			this.__endGame();
		}.bind(this)).catch(EndGame, function() {

			this.__endGame();
		}.bind(this))
	}

	this.__endGame = function() {
		recursiveLog.log('STOP: Game');
		this.__gameEnded = true;
		this.broadcast({
			topic: 'game_ended',
		});

	}

	this.__playerDisconnected = function(player) {
		this.broadcast({
			topic: 'player_disconnected',
			msg: player.getID()
		})
	}

	this.__registerUser = function(user) {

		// Does all the linking between User, Player and Game
		var player;
		if (user instanceof Player) {
			player = user;
		} else {
			player = new Player(user);
		}

		this.__players.push(player);
		player.__setGame(this);
		this.broadcast({
			topic: 'player_registered',
			msg: player.getID()
		});
	}

	this.register = function(userPolym) {
		// Call game beforeRegistration extended method
		// Provide extended method a way to abort registration through raising an exception 
		var user;
		if (userPolym instanceof Player) {
			user = userPolym.user
		} else {
			user = userPolym;
		}

		return Promise.try(function() {

			if (this.__registrationClosed) {
				// Already closed
				throw new RegistrationPrevent();
			}
			// This must be before game's beforeRegistration hook!
			user.beforeRegistration(function() {
				throw new RegistrationPrevent();
			});

			this.beforeRegistration(
				user, 
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

			// If neither raised an exception, add the player in!
			this.__registerUser(userPolym);
			return true;
		}.bind(this))
		.catch(RegistrationPrevent, function(err) {

			user.msg({
				topic: 'registration_prevent',
				gameID: this.id
			})
			return null;
		}.bind(this))
		.catch(RegisterAndStartGameAction, function() {

			this.__registerUser(userPolym);
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

	this.__getID = function() {
		return this.id;
	}

	this.initializeLocalWorld = function(world, _players) {
		return world;
	}

	this.onPlayerDisconnect = function(world, players, actions) {
		return true;
	}

 	this.beforeRegistration = function(
		user, 
		players, 
		registrationPreventAction, 
		registerAndStartGameAction
	) {
		recursiveLog.log2('Hook: beforeRegistration');
		return true;
	
	}
}

module.exports = Game;