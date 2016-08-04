var actions = {
	endGame: function() {
		throw new GameEnded();
	}
}

// Game contains one or more Rounds
// Round contains one or more Moves or (sub)Rounds
// Move is a primitive which waits for User input

PokerGame.prototype = new Game();
Hand.prototype = new Round();

var sitAndGo = new PokerGame({
	initialWorld: {
		// Chips for each player
		p1: 1000,
		p2: 1000,
		p3: 1000
	}
	loopRounds: true,
	rounds: [
		new Hand({
			initialWorld: function(playersParticipating) {
				/* Parameter something like:
				{
					'mike': 560,
					'matt': 420,
					'jean': 1010
				}
				*/

			}
		})
	]
});


function PokerGame(settings) {

	this.world = settings.initialWorld;
	this.rounds = settings.rounds;

	this.beforeFirstRound = function(roundName) {
		// Return val from here will be passed as initialWorld of the Round!
		return this.beforeRound(roundName);

	}

	this.beforeRound = function(roundName, actions) {
		return _
		.chain(this.world.remainingPlayers)
		.keyBy(function(player) {
			return player.id;
		})
		.mapValues(function(player, _playerID) {
			return player.chips;
		}) 
	}

	this.afterRound = function(roundWorld, actions) {
		// Modify this.world based on round results

		return actions.endGame();


	}

	this.afterLastRound = function(roundWorld) {

	}

	this.start = function() {
		return Promise
		.mapSeries(this.rounds, function(round) {
			return round.start(this.beforeRound(round.name, actions))
			.then(function(roundFinalWorld) {
				return this.afterRound(round.name, roundFinalWorld, actions);
			}.bind(this));
		}.bind(this))
		.then(function() {
			// One pass-through of this.rounds completed
			// If we have looping set on, we go back and do it again
			if (settings.loopRounds) {
				return this.start();
			}
		}.bind(this))
	}

}

function Round(settings) {

	this.start = function(initialWorld) {
		return Promise
		.mapSeries(this.rounds, function(round) {
			return round.start(this.beforeRound(round.name, actions))
			.then(function(roundFinalWorld) {
				return this.afterRound(round.name, roundFinalWorld, actions);
			}.bind(this));
		}.bind(this))
		.then(function() {
			// One pass-through of this.rounds completed
			// If we have looping set on, we go back and do it again
			if (settings.loopRounds) {
				return this.start();
			}
		}.bind(this))		
	}
}

function MoveRound(settings) {
	this.players = settings.players;

	this.start = function(players) {
		// If no players anymore, we end the move round
		if (players.length === 0) throw new MoveRoundEnded();

		return Promise
		.mapSeries(players, function(player) {
			return Promise.any([
				player.yourMove(),
				Promise.delay(5000).return({timeout: true})
			])
		}.bind(this))
		// Check whether player timed out
		.then(function(move) {
			// Check if timed out
			if (_.has(move, 'timeout') && move.timeout === true) {
				return this.timeoutHandling(player);
			}
			return this.moveHandling(move, player, illegalCount)
		}.bind(this))			
		.then(_.compact) // Filter out players who did not survive their moves
		.then(function(remainingPlayers) {
			// One pass-through of this.players completed
			// If we have looping set on, we go back and do it again
			// but only for the remaining players!
			if (settings.loopRounds) {
				return this.start(remainingPlayers);
			} else {
				// We end the move round by default
				throw new MoveRoundEnded();
			}
		}.bind(this))		
	}	

	// To be extended / overwritten
	this.timeoutHandling = function() {

	}

	// To be extended / overwritten
	this.moveHandling = function() {

	}

	this.transformMessageToPlayer = function(world, player, message) {

	}

	this.transformMessageFromPlayer = function(world, player, message) {

	}
}

function Move() {

	// Gets input from actual player
	this.start = function() {
		return player.yourMove().timeout(5000);
	}

	this.beforeStart = function() {

	}

	this.afterFinish = function() {

	}
}


// Kick things off

sitAndGo.start()
.catch(TournamentEnded, function(tournamentResults) {
	console.log("Winner is " + tournamentResults.winner);
});