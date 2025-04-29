class Ship {
  constructor(length, orientation = 'horizontal') {
    this.length = length;
    this.orientation = orientation;
    this.timesHit = 0;
  }

  hit() {
    this.timesHit++;
  }

  isSunk() {
    return this.timesHit == this.length;
  }
}

export { Ship };
