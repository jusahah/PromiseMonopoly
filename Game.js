var _ = require('lodash');
var Promise = require('bluebird');

/** Exceptions */
var RegistrationNotOpen     = require('./exceptions/RegistrationNotOpen');
var PlayerAlreadyRegistered = require('./exceptions/PlayerAlreadyRegistered');
var PlayerNotRegistered     = require('./exceptions/PlayerNotRegistered');
var AdditionCheckFailed     = require('./exceptions/AdditionCheckFailed');
var LaunchFailed            = require('./exceptions/LaunchFailed');

/** Game states */
// Waiting for registrations
var RegistrationOpen = require('./gamestates/RegistrationOpen');
// Launching in progress
var GameLaunching    = require('./gamestates/GameLaunching');
// Playing
var GameInProgress   = require('./gamestates/GameInProgress');
// Finished
var GameFinished     = require('./gamestates/GameFinished');


module.exports = function Game(id, settings) {

	/** Whether this game has already completed launching sequence */
	this.launched = false;

	/** Game id for keeping this game separate of other games */
	this._id = id;

	/** Players array taking part in this game */
	this._players = [];

	/** Tracks the current state of the game */
	this._currentState = null;

	/** Actions */
	var thisLexical = this;

	this.actions = {
		RegistrationOpen: {
			launch: function() {
				// We first change the state so that no other calls to this function
				// accidentally relaunch the game
				thisLexical._changeState(new GameLaunching(thisLexical));
				// We must let the current loop go through as some players are still
				// to be added to players list.
				_.defer(thisLexical.launch.bind(thisLexical));

			},
		},

		GameLaunching: {},

		GameInProgress: {
			declareWinner: function() {
				throw new WinnerDeclared();
			},
			declareDraw: function() {
				throw new DrawDeclared();
			},
			giveTurnBack: function() {
				throw new RetryTurn();
			},
			customMsgAll: function(msg) {
				_.map(players, function(player) {
					player.customMsg(msg);
				})
			}		
		},

		GameFinished: {}		
	}

	/*
	* Player object to call this method if player's connection is lost
	* @param {Player} - The player object that disconnects.
	* @returns undefined
	*/	
	this.playerDisconnecting = function(player) {
		// Note that Player must have set her hasDisconnected = true by now!
		// That way actual disconnecting is handled in GameInProgress state!
		// Here we simply broadcast notification
		this.msgToAll({
			topic: 'player_disconnect',
			msg: player.id
		});
	}

	/*
	* Launches the game (moves from GameLaunching to GameInProgress state)
	* @returns True
	* @throws {LaunchFailed}
	*/	
	this.launch = function() {
		if (this.launched) {
			throw new LaunchFailed('Launch already been completed - can not relaunch');
		}
		console.log("---GAME LAUNCHING---");
		console.log("Players: " + _.reduce(this._players, function(s, p) {
			return s + p.id + ", ";
		}, ''))
		// Make sure we don't relaunch
		this.launched = true;
		this._changeState(new GameInProgress(this, {c: 0}));

		
	}

	/** Private state changer, takes also care of messaging state changes to players */
	this._changeState = function(newState) {
		this._currentState = newState;
		console.log("Game progressed to new state: " + newState.name);
		this.msgToAll({
			topic: 'game_state_change',
			msg: newState.name
		});
	}

	/*
	* Registers player to this game
	* @param {Object} player - The player object
	* @returns True if success in registering
	* @throws {PlayerAlreadyRegistered}
	* @throws {AdditionCheckFailed}
	* @throws {RegistrationNotOpen}
	*/
	this.addPlayer = function(player) {
		// additionCheck defined in child class!
		if (!(this._currentState instanceof RegistrationOpen)) {
			throw new RegistrationNotOpen();
		}
		if (this.hasRegistered(player)) throw new PlayerAlreadyRegistered();
		if (!this.registrationHook(player, _.slice(this._players), this.actions.RegistrationOpen)) {
			throw new AdditionCheckFailed();
		}

		// Add player
		this._players.push(player);

		// Link player to this game
		player.linkToGame(this);

		// Inform all players
		this.msgToAll({
			topic: 'player_registered',
			msg: player.id
		});			
		return true;
		
	}
	/*
	* Unregisters player from this game
	* @param {Object} player - The player object
	* @returns True if success in removal
	* @throws {PlayerNotRegistered}
	*/
	this.removePlayer = function(player) {
		if (hasRegistered(player)) {
			// Remove player
			_.pull(this._players, player);
			// Unlink player from this game
			player.unlinkFromGame(this);
			// Inform remaining players
			this.msgToAll({
				topic: 'player_left',
				msg: player.id
			});
			return true;
		}
		throw new PlayerNotRegistered();
	}
	/*
	* Checks if player is registered to this game
	* @param {Object} player - The player object
	* @returns True if registered, false otherwise
	*/
	this.hasRegistered = function(player) {
		return _.indexOf(this._players, player) !== -1;
	} 
	/*
	* Sends msg to all remaining players of the game
	* @param {Object} msg - The msg object
	* @returns undefined
	*/
	this.msgToAll = function(msg) {
		// Decorate with extra info
		msg.gameID = this._id;

		_.map(this._players, function(player) {
			player.customMsg(msg);
		})
	}


	/* TO BE DEFINED IN EXTENDING CLASSES OR INJECTED THROUGH HOOKS */

	this.registrationHook = function(player, copyOfPlayers, registrationOpenActions) {
		/* Note:
		* You do NOT have to check following (they are already checked by framework):
		* 1) That the game is in 'registration open' state
		* 2) That player has not already registered (duplicate registration)
		*/

		// If you want launch the game from here, call:
		// registrationOpenActions.launch();

		//if (copyOfPlayers.length === 2) registrationOpenActions.launch();
		return true;
	}

	// Kick off by progressing to RegistrationOpen state
	this._changeState(new RegistrationOpen(this));
}