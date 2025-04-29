import { Ship } from '../modules/ship.js';

describe('Ship', () => {
  it('should create a ship with the given length', () => {
    const ship = new Ship(3);
    expect(ship.length).toBe(3);
    expect(ship.timesHit).toBe(0);
  });

  it('should increase timesHit when hit', () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.timesHit).toBe(1);
  });
});
