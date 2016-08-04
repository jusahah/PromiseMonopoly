function Move() {

	this.sendMoveRequest = function(world, actions) {
		return {
			availableMoves: world.getAvailableMoves()
		}
	}

	this.receiveMove = function(world, move, actions) {
		
	}

}

module.exports = Move;