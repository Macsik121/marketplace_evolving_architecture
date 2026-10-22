'use strict';

class StockQuantity {
  #value;

  constructor(value) {
    if (!Number.isInteger(value)) {
      throw new TypeError('Stock quantity must be an integer');
    }
    if (value < 0) {
      throw new RangeError('Stock quantity cannot be negative');
    }
    this.#value = value;
    Object.freeze(this);
  }

  get value() { return this.#value; }

  isAvailable(requested) {
    if (!Number.isInteger(requested) || requested < 0) {
      throw new TypeError('Requested quantity must be a non-negative integer');
    }
    return this.#value >= requested;
  }

  decrease(amount) {
    if (!this.isAvailable(amount)) {
      throw new Error(`Insufficient stock: available ${this.#value}, requested ${amount}`);
    }
    return new StockQuantity(this.#value - amount);
  }

  increase(amount) {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new TypeError('Increase amount must be a non-negative integer');
    }
    return new StockQuantity(this.#value + amount);
  }

  equals(other) {
    return other instanceof StockQuantity && this.#value === other.#value;
  }

  isZero() {
    return this.#value === 0;
  }

  toDTO() { return this.#value; }
  toJSON() { return this.#value; }

  static fromDTO(dto) {
    return new StockQuantity(dto);
  }

  static zero() {
    return new StockQuantity(0);
  }
}

module.exports = StockQuantity;
