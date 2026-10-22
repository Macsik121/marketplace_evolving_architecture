'use strict';

class Email {
  #value;
  static #EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(value) {
    if (typeof value !== 'string') {
      throw new TypeError('Email must be a string');
    }
    if (!Email.#EMAIL_REGEX.test(value)) {
      throw new Error(`Invalid email format: ${value}`);
    }
    this.#value = value.toLowerCase().trim();
    Object.freeze(this);
  }

  get value() { return this.#value; }

  equals(other) {
    return other instanceof Email && this.#value === other.#value;
  }

  toDTO() {
    return this.#value;
  }

  toJSON() {
    return this.#value;
  }

  static fromDTO(dto) {
    return new Email(dto);
  }
}

module.exports = Email;
