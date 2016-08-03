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

var msgAcceptorFor = function(playerLetter) {

	var lostGame = false;
	var activeBg = '#99eeff';
	var lostBg = '#999999';
	var wonBg = '#FFD700';
	var drawBg = '#dddddd';

	var el = jquery('#p' + playerLetter);

	return function(msg) {
		//console.error("MSG!");
		
		el.empty().append(msg.topic);

		if (msg.topic === 'yourTurn') {
			el.css('background-color', 'green');
		} else if (msg.topic === 'player_registered') {
			if (msg.msg === playerLetter) {
				el.css('background-color', activeBg);
			}
		} else if (msg.topic === 'youLost') {
			lostGame = true;
			el.css('background-color', lostBg);
		} else if (msg.topic === 'winner_declared') {
			if (msg.msg === playerLetter) {
				el.css('background-color', wonBg);
			}
		} else if (msg.topic === 'draw_declared') {
			if (_.indexOf(msg.msg, playerLetter) !== 1) {
				// This player was one who drew
				el.css('background-color', drawBg);
			}
		} else if (msg.topic === 'moveWasMade') {
			if (!lostGame) {
				el.css('background-color', activeBg);
			}
		} else if (msg.topic === 'timeout') {
			lostGame = true;
			el.css('background-color', lostBg);
		}
		
	}

}
/*
var p1 = new Player('A', {}, msgAcceptorFor('A'));
var p2 = new Player('B', {}, msgAcceptorFor('B'));
var p3 = new Player('C', {}, msgAcceptorFor('C'));
var p4 = new Player('D', {}, msgAcceptorFor('D'));
*/

function createTestPlayers(num) {
	var area = jquery('#testingarea');
	return _.times(num, function(nth) {
		area.append('<div id="p' + nth + '" class="player"></div>');
		return new Player(nth, {}, msgAcceptorFor(nth));
	})
}

Promise.try(function() {
	return createTestPlayers(10);
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