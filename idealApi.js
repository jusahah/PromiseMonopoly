
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
				new RollDices(),
				new HandleResultOfDices(),
				new AskIfPlayerWantsToBuyHouses()
			]
		})
	]
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