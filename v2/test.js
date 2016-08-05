var Promise = require('bluebird');
var _ = require('lodash');

// Protos
var Player = require('./Player');

// Extends
var ChessMoveRound = require('./ChessMoveRound');

var chessRound = new ChessMoveRound({
	loop: true
});

console.log(chessRound.__settings);


chessRound.initialize({parent: 0}, [
	new Player('a'),
	new Player('b'),
	new Player('c')
])

chessRound.start();
