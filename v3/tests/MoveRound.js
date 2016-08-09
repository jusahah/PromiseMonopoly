var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');

// Protos
var User = require('../User');
var Player = require('../Player');

// Domain objs
var whitePlayer = new Player(new User('white'));
var blackPlayer = new Player(new User('black'));

var MoveRound = require('../MoveRound');

// Test starts

var moveRound = new MoveRound(
	{ loop: false}
);

moveRound.__initialize({}, [whitePlayer, blackPlayer]);
moveRound.__start();

