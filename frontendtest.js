var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');
var jquery = require('jquery');

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

var msgAcceptorFor = function(playerNum) {

	return function(msg) {
		//console.error("MSG!");
		var el = jquery('#p' + playerNum);
		el.empty().append(JSON.stringify(msg));
	}

}

var p1 = new Player('A', {}, msgAcceptorFor(1));
var p2 = new Player('B', {}, msgAcceptorFor(2));
var p3 = new Player('C', {}, msgAcceptorFor(3));
var p4 = new Player('D', {}, msgAcceptorFor(4));

Promise.try(function() {
	return [p1, p2, p3, p4];
})
.mapSeries(function(player) {
	return new Promise(function(resolve, reject) {
		_.delay(function() {
			console.log("Adding player to game: " + player.id);
			game.addPlayer(player);
			return resolve();
		}, Math.random() * 1000 + 1000);
	}).catch(RegistrationNotOpen, function() {
		console.log("--- Player failed to register - too late! ---");
	})
})
.delay(1500)
.then(function() {
	game.launch();
});