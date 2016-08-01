function GameEnded() {};
GameEnded.prototype = new Error();

module.exports = GameEnded;