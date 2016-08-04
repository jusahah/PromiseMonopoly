var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');
var jquery = require('jquery');
var Handlebars = require('handlebars');

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

// Player template
var source   = jquery("#player-template").html();
var playerTemplate = Handlebars.compile(source);

var msgAcceptorFor = function(playerLetter) {

	var lostGame = false;
	var activeBg = '#99eeff';
	var lostBg = '#999999';
	var wonBg = '#FFD700';
	var drawBg = '#dddddd';

	var el = jquery('#p' + playerLetter);

	var timerHandle = null;

	return function(msg) {
		//console.error("MSG!");
		
		el.find('.infofromserver').empty().append(msg.topic);

		if (msg.topic === 'yourTurn') {
			var timerEl = el.find('.timer');
			timerEl.empty().append(msg.timetomove);
			el.css('background-color', 'green');
			if (timerHandle) {
				clearInterval(timerHandle);
				timerHandle = null;
			}
			timerHandle = loopTimer(timerEl, msg.timetomove);
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
			if (timerHandle) {
				clearInterval(timerHandle);
				timerHandle = null;
			}
			if (!lostGame) {
				el.css('background-color', activeBg);
			}
		} else if (msg.topic === 'timeout') {
			if (timerHandle) {
				clearInterval(timerHandle);
				timerHandle = null;
			}
			lostGame = true;
			el.css('background-color', lostBg);
		}
		
	}

}

function loopTimer(el, time) {
	var endTime = Date.now() + time;
	return setInterval(function() {
		var timeLeft = endTime - Date.now();
		timeLeft = timeLeft < 0 ? 0 : timeLeft; 
		el.empty().append(timeLeft);
	}, 100);
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
		var playerUI = playerTemplate({
			playerLetter: nth
		});
		area.append(playerUI);
		var p = new Player(nth, {}, msgAcceptorFor(nth));
		setupInputListeners(area.find('#p' + nth), p);
		return p;

	})
}

function setupInputListeners(playerUI, player) {

	var actionbuttons = playerUI.find('.actionbuttons');

	actionbuttons.on('click', function(e) {
		var $e = jquery(e.target);
		console.log(e.target);
		console.log($e.attr('data-action'));

		if ($e.attr('data-action') === 'legalmove') {
			return player.receiveMoveFromFrontend({
				move: 'e4' // Legal move
			});
		}

		if ($e.attr('data-action') === 'legalmove_lose') {
			return player.receiveMoveFromFrontend({
				move: 'e5' // Legal move but loses game
			});
		}

		if ($e.attr('data-action') === 'illegalmove') {
			return player.receiveMoveFromFrontend({
				move: 'x8' // Illegal move
			});			
		}

		if ($e.attr('data-action') === 'disconnect') {
			return player.disconnect();			
		}

	});
}

Promise.try(function() {
	return createTestPlayers(3);
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