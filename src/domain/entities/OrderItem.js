'use strict';

const Money = require('../value-objects/Money');

class OrderItem {
  #orderItemId;
  #orderId;
  #productId;
  #quantity;
  #priceAtPurchase;

  constructor({ orderItemId, orderId, productId, quantity, priceAtPurchase }) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Quantity must be a positive integer');
    }

    this.#orderItemId = orderItemId;
    this.#orderId = orderId;
    this.#productId = productId;
    this.#quantity = quantity;
    this.#priceAtPurchase = priceAtPurchase instanceof Money ? priceAtPurchase : new Money(priceAtPurchase);
    Object.freeze(this);
  }

  get orderItemId() { return this.#orderItemId; }
  get orderId() { return this.#orderId; }
  get productId() { return this.#productId; }
  get quantity() { return this.#quantity; }
  get priceAtPurchase() { return this.#priceAtPurchase; }

  get subtotal() {
    return this.#priceAtPurchase.multiply(this.#quantity);
  }

  toDTO() {
    return {
      orderItemId: this.#orderItemId,
      orderId: this.#orderId,
      productId: this.#productId,
      quantity: this.#quantity,
      priceAtPurchase: this.#priceAtPurchase.toDTO().amount,
      subtotal: this.subtotal.toDTO().amount,
    };
  }

  toJSON() {
    return this.toDTO();
  }

  static fromDTO(dto) {
    return new OrderItem({
      orderItemId: dto.orderItemId,
      orderId: dto.orderId,
      productId: dto.productId,
      quantity: dto.quantity,
      priceAtPurchase: dto.priceAtPurchase,
    });
  }
}

module.exports = OrderItem;
