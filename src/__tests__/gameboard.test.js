import { Gameboard } from '../modules/gameboard.js';
import { BOARDSIZE } from '../modules/constants.js'; // Import the board size constant

describe('Gameboard', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard();
  });

  test('should create a board of the correct size', () => {
    expect(gameboard.board.length).toBe(BOARDSIZE);
    expect(gameboard.board[0].length).toBe(BOARDSIZE);
  });

  test('should place a horizontal ship on the board', () => {
    const ship = { length: 3, orientation: 'horizontal' };
    gameboard.placeShip(ship, [0, 0]);
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[0][1]).toBe(ship);
    expect(gameboard.board[0][2]).toBe(ship);
  });

  test('should place a vertical ship on the board', () => {
    const ship = { length: 3, orientation: 'vertical' };
    gameboard.placeShip(ship, [0, 0]);
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[1][0]).toBe(ship);
    expect(gameboard.board[2][0]).toBe(ship);
  });

  test('should not place a ship out of bounds horizontally', () => {
    const ship = { length: 3, orientation: 'horizontal' };
    expect(() => gameboard.placeShip(ship, [0, BOARDSIZE - 2])).toThrow(
      'Invalid placement',
    );
  });

  test('should not place a ship out of bounds vertically', () => {
    const ship = { length: 3, orientation: 'vertical' };
    expect(() => gameboard.placeShip(ship, [BOARDSIZE - 2, 0])).toThrow(
      'Invalid placement',
    );
  });

  test('should not place a ship overlapping another ship', () => {
    const ship1 = { length: 3, orientation: 'horizontal' };
    const ship2 = { length: 3, orientation: 'vertical' };
    gameboard.placeShip(ship1, [0, 0]);
    expect(() => gameboard.placeShip(ship2, [0, 0])).toThrow(
      'Invalid placement',
    );
  });

  test('should receive a hit on a ship', () => {
    const ship = {
      length: 3,
      orientation: 'horizontal',
      hit: jest.fn(),
      isSunk: jest.fn(() => false),
    };
    gameboard.placeShip(ship, [0, 0]);
    gameboard.receiveAttack({ x: 0, y: 0 });
    expect(ship.hit).toHaveBeenCalled();
  });
});
