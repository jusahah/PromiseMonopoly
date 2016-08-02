var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');

/** Exceptions coming from Game*/
var RegistrationNotOpen     = require('./exceptions/RegistrationNotOpen');
var PlayerAlreadyRegistered = require('./exceptions/PlayerAlreadyRegistered');
var PlayerNotRegistered     = require('./exceptions/PlayerNotRegistered');
var AdditionCheckFailed     = require('./exceptions/AdditionCheckFailed');
var LaunchFailed            = require('./exceptions/LaunchFailed');

// Domain deps
var Game = require('./Game');
var Player = require('./Player');

var game = new Game(uuid.v1(), {});

var p1 = new Player('A', {});
var p2 = new Player('B', {});
var p3 = new Player('C', {});
var p4 = new Player('D', {});

Promise.try(function() {
	return [p1, p2, p3, p4];
})
.mapSeries(function(player) {
	return new Promise(function(resolve, reject) {
		_.delay(function() {
			console.log("Adding player to game: " + player.id);
			game.addPlayer(player);
			resolve();
		}, Math.random() * 4000);
	});
})
.delay(1500)
.then(function() {
	game.launch();
});




