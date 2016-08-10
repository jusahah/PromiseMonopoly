var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');

var chai = require('chai');
var expect = chai.expect;

// Protos
var User = require('../User');
var Player = require('../Player');

// Domain objs
var whiteUser = new User('white')
var blackUser = new User('black')

var MoveRound = require('../MoveRound');
var Phase = require('../Phase');
var Game = require('../Game');

describe('Phase', function() {
	describe('onEnter + onExit', function() {
		it('Phase with empty subphases goes correctly', function(done) {
			var tracking = [];
			var testiphase = new Phase('testi', {loop: false}, []);
			testiphase.onEnter = function() {
				tracking.push("START");
			}

			testiphase.onExit = function() {
				tracking.push("STOP");
			}
			testiphase.__initialize({}, [new Player(whiteUser), new Player(blackUser)]);

			testiphase.__start()
			.then(function() {
				expect(tracking).to.deep.equal(['START', 'STOP']);
				done();
			})
		})
	})

	describe('onEnter + onExit one level deep', function() {
		it('Phase with 1 subphase goes correctly', function(done) {
			var tracking = [];
			var subphase = new Phase('sub', {loop: false}, []);
			var testiphase = new Phase('main', {loop: false}, [
				subphase
			]);

			subphase.onEnter = function() {
				tracking.push("SUB_START");
			}

			subphase.onExit = function() {
				tracking.push("SUB_STOP");
			}

			testiphase.onEnter = function() {
				tracking.push("MAIN_START");
			}

			testiphase.onExit = function() {
				tracking.push("MAIN_STOP");
			}

			testiphase.__initialize({}, [new Player(whiteUser), new Player(blackUser)]);

			testiphase.__start()
			.then(function() {
				expect(tracking).to.deep.equal(['MAIN_START', 'SUB_START', 'SUB_STOP', 'MAIN_STOP']);
				done();
			})
		})
	})

	describe('onEnter + onExit two levels deep', function() {
		it('Phase with 1+1 subphase goes correctly', function(done) {
			var tracking = [];
			var sub2phase = new Phase('sub2', {loop: false}, []);
			var subphase = new Phase('sub', {loop: false}, [sub2phase]);
			var testiphase = new Phase('main', {loop: false}, [
				subphase
			]);

			sub2phase.onEnter = function() {
				tracking.push("SUB2_START");
			}

			sub2phase.onExit = function() {
				tracking.push("SUB2_STOP");
			}

			subphase.onEnter = function() {
				tracking.push("SUB_START");
			}

			subphase.onExit = function() {
				tracking.push("SUB_STOP");
			}

			testiphase.onEnter = function() {
				tracking.push("MAIN_START");
			}

			testiphase.onExit = function() {
				tracking.push("MAIN_STOP");
			}

			testiphase.__initialize({}, [new Player(whiteUser), new Player(blackUser)]);

			testiphase.__start()
			.then(function() {
				expect(tracking).to.deep.equal([
					'MAIN_START', 
					'SUB_START', 
					'SUB2_START',
					'SUB2_STOP',
					'SUB_STOP', 
					'MAIN_STOP'
				]);
				done();
			})
		})
	})

	describe('onEnter + onExit one level deep', function() {
		it('Phase with 3 subphases goes correctly', function(done) {
			var tracking = [];
			var sub3phase = new Phase('sub3', {loop: false}, []);
			var sub2phase = new Phase('sub2', {loop: false}, []);
			var subphase = new Phase('sub', {loop: false}, []);

			var testiphase = new Phase('main', {loop: false}, [
				subphase, sub2phase, sub3phase
			]);

			sub3phase.onEnter = function() {
				tracking.push("SUB3_START");
			}

			sub3phase.onExit = function() {
				tracking.push("SUB3_STOP");
			}

			sub2phase.onEnter = function() {
				tracking.push("SUB2_START");
			}

			sub2phase.onExit = function() {
				tracking.push("SUB2_STOP");
			}

			subphase.onEnter = function() {
				tracking.push("SUB_START");
			}

			subphase.onExit = function() {
				tracking.push("SUB_STOP");
			}

			testiphase.onEnter = function() {
				tracking.push("MAIN_START");
			}

			testiphase.onExit = function() {
				tracking.push("MAIN_STOP");
			}

			testiphase.__initialize({}, [new Player(whiteUser), new Player(blackUser)]);

			testiphase.__start()
			.then(function() {
				expect(tracking).to.deep.equal([
					'MAIN_START', 
					'SUB_START', 
					'SUB_STOP', 
					'SUB2_START',
					'SUB2_STOP',
					'SUB3_START',
					'SUB3_STOP',
					'MAIN_STOP'
				]);
				done();
			})
		})
	})

	describe('onEnter + onExit three levels deep', function() {
		it('Phase with 3+1+2 subphases goes correctly', function(done) {
			var tracking = [];
			var sub13phase = new Phase('sub3', {loop: false}, []);
			var sub23phase = new Phase('sub3', {loop: false}, []);
			var sub3phase = new Phase('sub3', {loop: false}, [sub13phase, sub23phase]);

			var sub2phase = new Phase('sub2', {loop: false}, [sub3phase]);
			var subphase = new Phase('sub', {loop: false}, [sub2phase, sub13phase]);

			var testiphase = new Phase('main', {loop: false}, [
				subphase, subphase
			]);
			sub13phase.onEnter = function() {
				tracking.push("SUB13_START");
			}

			sub13phase.onExit = function() {
				tracking.push("SUB13_STOP");
			}

			sub23phase.onEnter = function() {
				tracking.push("SUB23_START");
			}

			sub23phase.onExit = function() {
				tracking.push("SUB23_STOP");
			}

			sub3phase.onEnter = function() {
				tracking.push("SUB3_START");
			}

			sub3phase.onExit = function() {
				tracking.push("SUB3_STOP");
			}

			sub2phase.onEnter = function() {
				tracking.push("SUB2_START");
			}

			sub2phase.onExit = function() {
				tracking.push("SUB2_STOP");
			}

			subphase.onEnter = function() {
				tracking.push("SUB_START");
			}

			subphase.onExit = function() {
				tracking.push("SUB_STOP");
			}

			testiphase.onEnter = function() {
				tracking.push("MAIN_START");
			}

			testiphase.onExit = function() {
				tracking.push("MAIN_STOP");
			}

			testiphase.__initialize({}, [new Player(whiteUser), new Player(blackUser)]);

			testiphase.__start()
			.then(function() {
				expect(tracking).to.deep.equal([
					'MAIN_START', 

					 'SUB_START',
					  'SUB2_START',
					   'SUB3_START',
					    'SUB13_START',
					    'SUB13_STOP',
					    'SUB23_START', 
					    'SUB23_STOP', 
					   'SUB3_STOP',
					  'SUB2_STOP',
					  'SUB13_START',
					  'SUB13_STOP',
					 'SUB_STOP',
					 // Start over for second subphase
					 'SUB_START',
					  'SUB2_START',
					   'SUB3_START',
					    'SUB13_START',
					    'SUB13_STOP',
					    'SUB23_START' ,
					    'SUB23_STOP', 
					   'SUB3_STOP',
					  'SUB2_STOP',
					  'SUB13_START',
					  'SUB13_STOP',
					 'SUB_STOP',

					'MAIN_STOP'
				]);
				done();
			})
		})
	})

})

