'use strict';

class CartItem {
  #cartItemId;
  #userId;
  #productId;
  #quantity;
  #updatedAt;

  constructor({ cartItemId, userId, productId, quantity, updatedAt }) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Quantity must be a positive integer');
    }

    this.#cartItemId = cartItemId;
    this.#userId = userId;
    this.#productId = productId;
    this.#quantity = quantity;
    this.#updatedAt = updatedAt || new Date();
    Object.freeze(this);
  }

  get cartItemId() { return this.#cartItemId; }
  get userId() { return this.#userId; }
  get productId() { return this.#productId; }
  get quantity() { return this.#quantity; }
  get updatedAt() { return this.#updatedAt; }

  updateQuantity(newQuantity) {
    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      throw new Error('Quantity must be a positive integer');
    }
    return new CartItem({
      ...this.#toObject(),
      quantity: newQuantity,
      updatedAt: new Date(),
    });
  }

  #toObject() {
    return {
      cartItemId: this.#cartItemId,
      userId: this.#userId,
      productId: this.#productId,
      quantity: this.#quantity,
      updatedAt: this.#updatedAt,
    };
  }

  toDTO() {
    return {
      cartItemId: this.#cartItemId,
      userId: this.#userId,
      productId: this.#productId,
      quantity: this.#quantity,
      updatedAt: this.#updatedAt instanceof Date ? this.#updatedAt.toISOString() : this.#updatedAt,
    };
  }

  toJSON() {
    return this.toDTO();
  }

  static fromDTO(dto) {
    return new CartItem({
      cartItemId: dto.cartItemId,
      userId: dto.userId,
      productId: dto.productId,
      quantity: dto.quantity,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
    });
  }
}

module.exports = CartItem;
