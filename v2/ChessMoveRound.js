var Promise = require('bluebird');
var _ = require('lodash');

// Protos
var MoveRound = require('./MoveRound');

function ChessMoveRound(settings) {

	MoveRound.call(this, settings);

	this.checkMoveLegality = function(move, localWorld) {
		console.log("ChessMoveRound: Check legality")
		return true;
	}

	this.handleIllegalMove = function(move, localWorld) {
		console.log("ChessMoveRound: Handle ILLEGAL")
		return false;
	} 

	this.handleLegalMove = function(move, localWorld) {
		console.log("ChessMoveRound: Handle LEGAL")
		return true;
	}
}


// Set prototype link
ChessMoveRound.prototype = Object.create(MoveRound.prototype);


module.exports = ChessMoveRound;
