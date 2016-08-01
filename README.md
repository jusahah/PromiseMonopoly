# PromiseMonopoly

A framework for creating turn-based multiplayer games quickly by hooking in custom handlers.

**Project name is 'PromiseMonopoly' due the fact that the framework should be especially well-suited to implement Monopoly-game. The framework is game-agnostic, and can be used to implement turn-based games like Chess, Poker, Battleship, etc.

### Goal

To create a framework which handles all/most of the common tasks regarding building server-based multiplayer game. 
Only turn-based games supported. Common tasks I try to abstract for the framework to handle are:

1. Gameplay flow (player 1 moves first, then player 2, then player 3, etc..)
2. Taking care of disconnects.
3. Game state modifications (modificator injected by client code).
4. Handle flag falls (= player runs out of time to make her move).
5. Move legality checking (checker injected by client code).
6. Removing players from the gameplay flow when they've been declared lost.
7. Automatically ending the game when only one player left.
7. Providing easy API to control game outcome (*declareDraw, retryTurn, etc.*)
... and so on

This is a personal hobby project. Uses heavily Bluebird-library to manage promise chains. 

### MIT Licence and so on.


