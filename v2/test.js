var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');

// Protos
var User = require('./User');
var Player = require('./Player');
var GamePhase = require('./GamePhase');
var Game = require('./Game');

// Chess related
var ChessMatch = require('./ChessMatch');
var ChessGame  = require('./ChessGame');
var ChessMoveRound = require('./ChessMoveRound');

var whiteUser = new User('white');
var blackUser = new User('black');
var redUser   = new User('red');

var chessMatch = new ChessMatch(
	{
		whiteWon: 0, 
		blackWon: 0, 
		draws: 0,
		gamesPlayed: 0
	},
	[
		new ChessGame(
			{
				loop: true
			},
			[
				new ChessMoveRound({
					loop: true
				}),
			]
		),	
	]
)

var redRes   = chessMatch.addPlayer(new Player(redUser));
var blackRes = chessMatch.addPlayer(new Player(blackUser));
var whiteRes = chessMatch.addPlayer(new Player(whiteUser));

Promise.all([whiteRes, blackRes, redRes])
.then(function(registrationResults) {
	console.log("Reg results");
	console.log(registrationResults);
})
.then(function() {
	//chessMatch.start();
})



/*
var game = new Game(
	{},
	[
		new Player('white'),
		new Player('black'),
	],
	[
		new GamePhase(
			'firstPhase',
			[
				new ChessMoveRound({
					loop:false
				}),
				new ChessMoveRound({
					loop: false
				})
			]
		),
		new GamePhase(
			'secondPhase',
			[
				new ChessMoveRound({
					loop:false
				}),
				new ChessMoveRound({
					loop: false
				})
			]
		),	
	]
);

game.start();
*/

function chessTest() {
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
}

