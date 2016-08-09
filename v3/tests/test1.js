var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');

// Protos
var User = require('../User');
var Player = require('../Player');

// Domain objs
var whiteUser = new User('white')
var blackUser = new User('black')

var MoveRound = require('../MoveRound');
var Phase = require('../Phase');
var Game = require('../Game');

var alkujuhla = new Phase('alkujuhla', {loop: false}, []);

var kierroksetPhase = new Phase('kierros', {loop: false}, [
	new Phase('peli', {loop: false}, [
		new MoveRound(
			{ loop: true}
		)
	])

]);

var loppujuhla = new Phase('loppujuhla', {loop: false}, [
	new MoveRound(
		{ loop: false}
	)

])

var tilaisuus = new Game({phases: 0, moverounds: 0}, [loppujuhla, alkujuhla, kierroksetPhase, loppujuhla]);

tilaisuus.register(whiteUser)
.then(function() {
	tilaisuus.register(blackUser);
})
.then(function() {
	tilaisuus.start();
})

setInterval(function() {
	console.log(".");
}, 250);


setTimeout(function() {
	console.log("---- DISCONNECT WHITE ----");
	//whiteUser.disconnect();
}, 6500);

setTimeout(function() {
	console.log("---- DISCONNECT WHITE ----");
	//blackUser.disconnect();
}, 9500);
/** Initialize with initial global state and players participating */
/*
phase1.__initialize({}, [whitePlayer, blackPlayer]);
phase1.__start();
*/