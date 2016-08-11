var Promise = require('bluebird');
var _ = require('lodash');
var jquery = require('jquery');
var Handlebars = require('handlebars');
// Protos
var User = require('./protos/User');
var Player = require('./protos/Player');

// Poker related
var SitAndGo = require('./SitAndGo');
var Hand = require('./Hand');
var Preflop = require('./Preflop');
var Flop = require('./Flop');
var Turn = require('./Turn');
var River = require('./River');
var BettingRound = require('./BettingRound');

/*
var p1User = new User('p1', msgAcceptorFor(1));
var p2User = new User('p2', msgAcceptorFor(2));
var p3User = new User('p3', msgAcceptorFor(3));


var singleHand = new Hand('hand', {loop: false}, [
	new Preflop('preflop', {loop: false}, []),
	new BettingRound('betting', {loop: true}),
	new Flop('flop', {loop: false}, []),
	new BettingRound('betting', {loop: true}),
	new Turn('turn', {loop: false}, []),
	new BettingRound('betting', {loop: true}),
	new River('river', {loop: false}, []),
	new BettingRound('betting', {loop: true}),
]);

singleHand.__initialize({
	chips: {
		p1: 1000,
		p2: 1000,
		p3: 1000
	},
	currentHand: {
		pot: 0,
		holeCards: {
			p1: [],
			p2: [],
			p3: []
		},
		boardCards: [],
		betsOnTable: {
			p1: 0,
			p2: 0,
			p3: 0
		}
	}

}, [
	new Player(p1User),
	new Player(p2User),
	new Player(p3User)
]);

singleHand.__start();
*/

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

function createTestUsers(num) {



	var area = jquery('#testingarea');
	return _.times(num, function(nth) {
		var playerUI = playerTemplate({
			playerLetter: nth
		});
		area.append(playerUI);
		var p = new User('p'+nth, msgAcceptorFor(nth));
		setupInputListeners(area.find('#p' + nth), p);
		return p;

	})
}

function setupInputListeners(playerUI, user) {

	var actionbuttons = playerUI.find('.actionbuttons');

	actionbuttons.on('click', function(e) {
		var $e = jquery(e.target);
		console.log(e.target);
		console.log($e.attr('data-action'));

		if ($e.attr('data-action') === 'bet') {
			return user.receiveMoveFromFrontend({
				move: 'e4' // Legal move
			});
		}

		if ($e.attr('data-action') === 'check') {
			return user.receiveMoveFromFrontend({
				move: 'e5' // Legal move but loses game
			});
		}

		if ($e.attr('data-action') === 'fold') {
			return user.receiveMoveFromFrontend({
				move: 'x8' // Illegal move
			});			
		}

		if ($e.attr('data-action') === 'disconnect') {
			return user.disconnect();			
		}

	});
}

Promise.try(function() {
	return createTestUsers(3);
})
.then(function(users) {

	var singleHand = new Hand({loop: false}, [
		new Preflop({loop: false}, []),
		new BettingRound({loop: true}),
		new Flop({loop: false}, []),
		new BettingRound({loop: true}),
		new Turn({loop: false}, []),
		new BettingRound({loop: true}),
		new River({loop: false}, []),
		new BettingRound({loop: true}),
	]);

	var sitAndGo = new SitAndGo({
		chips: {
			p1: 1000,
			p2: 1000,
			p3: 1000
		},
		currentHand: {
			pot: 0,
			holeCards: {
				p1: [],
				p2: [],
				p3: []
			},
			boardCards: [],
			betsOnTable: {
				p1: 0,
				p2: 0,
				p3: 0
			}
		}

	}, [
		singleHand,
		singleHand,
		singleHand
	])
	console.log("singleHand");
	console.log(singleHand);
	return [sitAndGo, users];
})
.tap(function(arr) {
	var sitAndGo = arr[0];
	var users = arr[1];
	return Promise.mapSeries(users, function(user) {
		return sitAndGo.register(user);
	});
})
.then(function(arr) {
	var sitAndGo = arr[0];
	console.log("Calling start() of SitAndGo")
	sitAndGo.start();
});