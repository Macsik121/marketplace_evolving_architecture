'use strict';

class ProductSku {
  #value;
  static #SKU_REGEX = /^[A-Z0-9\-_]{3,50}$/;

  constructor(value) {
    if (typeof value !== 'string') {
      throw new TypeError('SKU must be a string');
    }
    const normalized = value.toUpperCase().trim();
    if (!ProductSku.#SKU_REGEX.test(normalized)) {
      throw new Error(`Invalid SKU format: ${value}. Must be 3-50 alphanumeric characters, hyphens, or underscores`);
    }
    this.#value = normalized;
    Object.freeze(this);
  }

  get value() { return this.#value; }

  equals(other) {
    return other instanceof ProductSku && this.#value === other.#value;
  }

  toDTO() { return this.#value; }
  toJSON() { return this.#value; }

  static fromDTO(dto) {
    return new ProductSku(dto);
  }
}

module.exports = ProductSku;
