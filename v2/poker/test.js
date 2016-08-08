var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');

// Protos
var User = require('../User');
var Player = require('../Player');
var GamePhase = require('../GamePhase');
var Game = require('../Game');

// Domain-specific
var PokerHand = require('./PokerHand');
var Preflop   = require('./Preflop');
var Flop      = require('./Flop');
var Turn      = require('./Turn');
var River     = require('./River');
var BettingRound = require('./BettingRound');

var pokerHand = new PokerHand(
	{
		chips: 1000,
		smallBlind: 10,
	},
	[
		new Preflop({loop: false}),
		new BettingRound({loop: true}),
		new Flop({loop: false}),
		new BettingRound({loop: true}),
		new Turn({loop: false}),
		new BettingRound({loop: true}),
		new River({loop: false}),
		new BettingRound({loop: true})
	]

);

var p1 = new User('p1');
var p2 = new User('p2');
var p3 = new User('p3');
var p4 = new User('p4');

Promise.all([
	pokerHand.register(p1), 
	pokerHand.register(p2), 
	pokerHand.register(p3), 
	pokerHand.register(p4)
])
.then(function(regResults) {
	console.log('Reg results');
	console.log(regResults);
	console.log('----- STARTING POKERHAND -----');
	pokerHand.start();
})


