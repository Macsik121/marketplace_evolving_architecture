'use strict';

const Money = require('../value-objects/Money');
const OrderItem = require('./OrderItem');

class Order {
  #orderId;
  #buyerId;
  #items;
  #status;
  #totalAmount;
  #shippingAddress;
  #createdAt;

  static STATUSES = Object.freeze(['pending', 'paid', 'shipped', 'delivered', 'cancelled']);

  static TRANSITIONS = Object.freeze({
    pending: ['paid', 'cancelled'],
    paid: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  });

  constructor({ orderId, buyerId, items, status, totalAmount, shippingAddress, createdAt }) {
    if (!Order.STATUSES.includes(status)) {
      throw new Error(`Invalid order status: ${status}. Must be one of: ${Order.STATUSES.join(', ')}`);
    }
    if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length === 0) {
      throw new Error('Shipping address is required');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    this.#orderId = orderId;
    this.#buyerId = buyerId;
    this.#items = Object.freeze(items.map(item => item instanceof OrderItem ? item : new OrderItem(item)));
    this.#status = status;
    this.#totalAmount = totalAmount instanceof Money ? totalAmount : new Money(totalAmount);
    this.#shippingAddress = shippingAddress.trim();
    this.#createdAt = createdAt || new Date();
    Object.freeze(this);
  }

  get orderId() { return this.#orderId; }
  get buyerId() { return this.#buyerId; }
  get items() { return this.#items; }
  get status() { return this.#status; }
  get totalAmount() { return this.#totalAmount; }
  get shippingAddress() { return this.#shippingAddress; }
  get createdAt() { return this.#createdAt; }

  canTransitionTo(newStatus) {
    if (!Order.STATUSES.includes(newStatus)) {
      return false;
    }
    return Order.TRANSITIONS[this.#status]?.includes(newStatus) || false;
  }

  transitionTo(newStatus) {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Cannot transition order from '${this.#status}' to '${newStatus}'`);
    }
    return new Order({
      ...this.#toObject(),
      status: newStatus,
    });
  }

  isPending() { return this.#status === 'pending'; }
  isPaid() { return this.#status === 'paid'; }
  isShipped() { return this.#status === 'shipped'; }
  isDelivered() { return this.#status === 'delivered'; }
  isCancelled() { return this.#status === 'cancelled'; }
  isCancellable() { return this.canTransitionTo('cancelled'); }

  #toObject() {
    return {
      orderId: this.#orderId,
      buyerId: this.#buyerId,
      items: this.#items,
      status: this.#status,
      totalAmount: this.#totalAmount,
      shippingAddress: this.#shippingAddress,
      createdAt: this.#createdAt,
    };
  }

  toDTO() {
    return {
      orderId: this.#orderId,
      buyerId: this.#buyerId,
      items: this.#items.map(item => item.toDTO()),
      status: this.#status,
      totalAmount: this.#totalAmount.toDTO().amount,
      shippingAddress: this.#shippingAddress,
      createdAt: this.#createdAt instanceof Date ? this.#createdAt.toISOString() : this.#createdAt,
    };
  }

  toJSON() {
    return this.toDTO();
  }

  static fromDTO(dto) {
    return new Order({
      orderId: dto.orderId,
      buyerId: dto.buyerId,
      items: dto.items.map(item => OrderItem.fromDTO(item)),
      status: dto.status,
      totalAmount: dto.totalAmount,
      shippingAddress: dto.shippingAddress,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
    });
  }
}

module.exports = Order;
