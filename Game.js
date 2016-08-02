var _ = require('lodash');
var Promise = require('bluebird');

/** Exceptions */
var RegistrationNotOpen     = require('./exceptions/RegistrationNotOpen');
var PlayerAlreadyRegistered = require('./exceptions/PlayerAlreadyRegistered');
var PlayerNotRegistered     = require('./exceptions/PlayerNotRegistered');
var AdditionCheckFailed     = require('./exceptions/AdditionCheckFailed');

/** Game states */
// Waiting for registrations
var RegistrationOpen = require('./gamestates/RegistrationOpen');
// Playing
var GameInProgress   = require('./gamestates/GameInProgress');
// Finished
var GameFinished     = require('./gamestates/GameFinished');

module.exports = function Game(id, settings) {

	/** Game id for keeping this game separate of other games */
	this._id = id;

	/** Players array taking part in this game */
	this._players = [];

	/** Tracks the current state of the game */
	this._currentState = new RegistrationOpen(this);

	/*
	* Launches the game (moves from RegistrationOpen to GameInProgress state)
	* @returns True
	* @throws {LaunchFailed}
	*/	
	this.launch = function() {
		if (this._currentState !instanceof RegistrationOpen) {
			throw new LaunchFailed('Launch can only be done in RegistrationOpen state');
		}

		this._changeState(new GameInProgress(this));
	}

	/** Private state changer, takes also care of messaging state changes to players */
	this._changeState = function(newState) {
		this._currentState = newState;
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
		if (this._currentState !instanceof RegistrationOpen) {
			throw new RegistrationNotOpen();
		}
		if (this.hasRegistered(player)) throw new PlayerAlreadyRegistered();
		if (!this.additionCheck(player, _.slice(this._players), this.actions)) {
			throw new AdditionCheckFailed();
		}

		// Add player
		this._players.push(player);
		// Inform all players
		this.msgToAll({
			topic: 'player_registered',
			msg: player
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
			// Inform remaining players
			this.msgToAll({
				topic: 'player_left',
				msg: player
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


	/* TO BE DEFINED IN EXTENDING CLASSES */

	this.additionCheck = function(player, copyOfPlayers, gameActions) {
		return true;
	}
}