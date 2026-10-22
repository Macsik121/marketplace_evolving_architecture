'use strict';

class Money {
  #amount;
  #currency;

  constructor(amount, currency = 'USD') {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new TypeError('Amount must be a finite number');
    }
    if (amount < 0) {
      throw new RangeError('Amount cannot be negative');
    }
    if (typeof currency !== 'string' || currency.length !== 3) {
      throw new TypeError('Currency must be a 3-letter code');
    }

    this.#amount = Math.round(amount * 100) / 100;
    this.#currency = currency;
    Object.freeze(this);
  }

  get amount() { return this.#amount; }
  get currency() { return this.#currency; }

  add(other) {
    if (!(other instanceof Money)) {
      throw new TypeError('Can only add Money to Money');
    }
    if (other.#currency !== this.#currency) {
      throw new Error(`Cannot add different currencies: ${this.#currency} and ${other.#currency}`);
    }
    return new Money(this.#amount + other.#amount, this.#currency);
  }

  subtract(other) {
    if (!(other instanceof Money)) {
      throw new TypeError('Can only subtract Money from Money');
    }
    if (other.#currency !== this.#currency) {
      throw new Error(`Cannot subtract different currencies: ${this.#currency} and ${other.#currency}`);
    }
    return new Money(this.#amount - other.#amount, this.#currency);
  }

  multiply(factor) {
    if (typeof factor !== 'number' || !Number.isFinite(factor)) {
      throw new TypeError('Factor must be a finite number');
    }
    return new Money(this.#amount * factor, this.#currency);
  }

  equals(other) {
    return other instanceof Money &&
           this.#amount === other.#amount &&
           this.#currency === other.#currency;
  }

  isZero() {
    return this.#amount === 0;
  }

  toDTO() {
    return { amount: this.#amount, currency: this.#currency };
  }

  toJSON() {
    return this.toDTO();
  }

  static fromDTO(dto) {
    if (typeof dto === 'number') {
      return new Money(dto);
    }
    return new Money(dto.amount, dto.currency);
  }

  static zero(currency = 'USD') {
    return new Money(0, currency);
  }
}

module.exports = Money;
