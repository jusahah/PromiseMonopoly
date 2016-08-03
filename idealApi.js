
// Represents poker session (sit n' go tournament, for example)
new Game({
		loopPhases: true, // There is no fixed amount of hands so we loop
	},
	[
		// Represents a single hand
		new Game({
				loopPhases: false, // Streets are fixed - always four streets.
			},
			[
				// Represents a single street within the hand
				new Preflop(),
				new Flop(),
				new Turn(),
				new River(),
			]
		),
	]
);
///////////////////
// Setting streets to inherit from Round
var RoundProto = new Round();
function Preflop() {}
Preflop.prototype = RoundProto;
// Same for other streets...
///////////////////

///////////////////
/*

Game, Preflop, Flop, Turn, River all follow interface 'actAsRound'!

actAsRound interface:
*/

function actAsRound(settings, phases) {

	this._phases = phases;

	this.nextPhase = function() {
		// If next phase exists, start it
		// Otherwise throw "PhasesDone" which will be caught
		// by the parent actAsRound object, thus allowing the
		// parent to move to its next phase

		// Every phase always hands down the list of remaining players
		// to the subphase it inits. 
	}

	this.endRound = function() {
		// Forces the end of this round
		// Will be caught by parent
		throw new PhasesDone();
	}
}

/// Monopoly


// There are two types of PRIMITIVE phases:
/*
	1) PlayerAction - broadcasts something to player and then waits for response
	2) AutoAction - doesn't wait for input from player, but from expensive server operation etc.
*/
new Game({
	loopPhases: true,
	timeout: {
		type: 'perTurn',
		seconds: 5,
	},
	[
		new LetEachPlayerMakeMove({
			loopPhases: false,
			[
				new RollDices({
					onStart: function() {
						console.log("Rolling dices");
					},
					// Send action request to player
					// Kicks off the timeout timer!
					sendActionRequest: function() {

					},
					// Receive action command from player
					// Stops the timeout timer (if it did not trigger already)
					receiveActionCommand: function() {

					},
					timeoutOccurred: function(world, player, players, actions) {
						actions.retryTurn();
					},
					takeAction: function(prevResult, world, player, players, actions) {
						// return dices results
						// Return value from here will be routed to next phase!
						return [1,1];
					},
					onEnd: function() {
						console.log("Dices have been rolled");
					}
				}),
				new HandleResultOfDices({
					takeAction: function(dices, world, player, players, actions) {
						// Move player figure
						// If not his, we can safely skip the last phase
						actions.skipRemainingPhases(); // Progresses turn to next player
					},
				}),
				new AskIfPlayerWantsToBuyHouses()
			],
			eventCallbacks: {
				onStart: function(world, players, actions) {
					console.log("Waiting player to move");
					actions.msgToAll({
						topic: ''
					})

				},
				onEnd: function(world, players, actions) {
					console.log("Player completed his move");
					world.tempState.pop();

				}
			}
		})
	],
	eventCallbacks: {
		onStart: function(world, players, actions) {
			console.log("Game started");

		},
		onEnd: function(world, players, actions) {
			console.log("Game ended");

		}
	}
})

// Chess

// Note that timeout events are always thrown so PARENT GAME can catch + handle them.
new Game({
	loopPhases: true,
	timeout: {
		type: 'perGame',
		seconds: 5 * 60,
	},
	[
		 new WaitForMove('white'),
		 new WaitForMove('black')
	]
})


// Extended version

new Game({
		loopPhases: true,
		timeout: {
			type: 'perGame',
			seconds: 5 * 60,
		},
		players: [new Player(socket1), new Player(socket2)],
		initialWorld: new Chess(),
	},
	[
		 new WaitForMove('white'),
		 new WaitForMove('black')
	],

)