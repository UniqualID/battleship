class Ship {
    constructor(length, orientation = 'horizontal') {
        this.length = length;
        this.orientation = orientation;
        this.timesHit = 0;
        this.id = crypto.randomUUID();
    }

    hit() {
        this.timesHit++;
    }

    isSunk() {
        return this.timesHit == this.length;
    }
}

export { Ship };
