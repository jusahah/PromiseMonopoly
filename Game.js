var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function Game(id, settings) {

	/** Game id for keeping this game separate of other games */
	this._id = id;

	/** Players array taking part in this game */
	this._players = [];

	/*
	* Registers player to this game
	* @param {Object} player - The player object
	* @returns True if successfully, false otherwise
	*/
	this.addPlayer = function(player) {
		// additionCheck defined in child class!
		if (this.additionCheck(player)) {
			// Add player
			this._players.push(player);
			// Inform all players
			this.msgToAll({
				topic: 'player_registered',
				msg: player
			});			
			return true;
		}

		return false;
	}

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
		return false;
	}

	this.hasRegistered = function(player) {
		return _.indexOf(this._players, player) !== -1;
	} 

	this.msgToAll = function(msg) {
		// Decorate with extra info
		msg.gameID = this._id;

		_.map(this._players, function(player) {
			player.customMsg(msg);
		})
	}
}