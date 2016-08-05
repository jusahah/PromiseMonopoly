var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');

// Protos
var Player = require('./Player');

// MoveRounds
var ChessMoveRound = require('./ChessMoveRound');

// 

var chessRound = new ChessMoveRound({
	loop: true
});



console.log(chessRound.__settings);


chessRound.__initialize({parent: 0}, [
	new Player('white'),
	new Player('black'),
])

chessRound.__start();

setInterval(function() {

	console.log(".");
}, 150);
