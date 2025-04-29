import { BOARDSIZE } from './constants';

class Gameboard {
  constructor() {
    this.board = Array.from({ length: BOARDSIZE }, () =>
      Array(BOARDSIZE).fill(null),
    );
    this.ships = [];
    this.missedAttacks = new Set();
    this.sunkShips = [];
  }
  placeShip(ship, coordinates) {
    const [x, y] = coordinates;
    if (this.isValidPlacement(ship, coordinates)) {
      for (let i = 0; i < ship.length; i++) {
        if (ship.orientation === 'horizontal') this.board[x][y + i] = ship;
        else this.board[x + i][y] = ship;
      }
      this.ships.push(ship);
    } else {
      throw new Error('Invalid placement');
    }
  }
  isValidPlacement(ship, coordinates) {
    const [x, y] = coordinates;
    if (ship.orientation == 'horizontal' && y + ship.length > BOARDSIZE)
      return false; // Out of bounds
    if (ship.orientation == 'vertical' && x + ship.length > BOARDSIZE)
      return false; // Out of bounds
    for (let i = 0; i < ship.length; i++) {
      if (ship.orientation == 'horizontal' && this.board[x][y + i] !== null)
        return false; // Overlapping ships
      if (ship.orientation == 'vertical' && this.board[x + i][y] !== null)
        return false; // Overlapping ships
    }
    return true;
  }
  receiveAttack({ x, y }) {
    if (this.board[x][y] !== null) {
      this.board[x][y].hit();
      if (this.board[x][y].isSunk()) {
        this.sunkShips.push(this.board[x][y]);
      }
      return true; // Hit
    } else {
      this.missedAttacks.add(`${x},${y}`);
      return false; // Miss
    }
  }
}

export { Gameboard };
