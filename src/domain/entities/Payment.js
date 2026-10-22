'use strict';

const Money = require('../value-objects/Money');

class Payment {
  #paymentId;
  #orderId;
  #paymentMethod;
  #transactionReference;
  #amount;
  #status;
  #processedAt;

  static STATUSES = Object.freeze(['pending', 'completed', 'failed', 'refunded']);
  static METHODS = Object.freeze(['credit_card', 'paypal', 'stripe', 'bank_transfer']);

  constructor({ paymentId, orderId, paymentMethod, transactionReference, amount, status, processedAt }) {
    if (!Payment.STATUSES.includes(status)) {
      throw new Error(`Invalid payment status: ${status}. Must be one of: ${Payment.STATUSES.join(', ')}`);
    }
    if (!Payment.METHODS.includes(paymentMethod)) {
      throw new Error(`Invalid payment method: ${paymentMethod}. Must be one of: ${Payment.METHODS.join(', ')}`);
    }

    this.#paymentId = paymentId;
    this.#orderId = orderId;
    this.#paymentMethod = paymentMethod;
    this.#transactionReference = transactionReference || null;
    this.#amount = amount instanceof Money ? amount : new Money(amount);
    this.#status = status;
    this.#processedAt = processedAt || null;
    Object.freeze(this);
  }

  get paymentId() { return this.#paymentId; }
  get orderId() { return this.#orderId; }
  get paymentMethod() { return this.#paymentMethod; }
  get transactionReference() { return this.#transactionReference; }
  get amount() { return this.#amount; }
  get status() { return this.#status; }
  get processedAt() { return this.#processedAt; }

  isPending() { return this.#status === 'pending'; }
  isCompleted() { return this.#status === 'completed'; }
  isFailed() { return this.#status === 'failed'; }
  isRefunded() { return this.#status === 'refunded'; }

  complete(transactionReference) {
    if (this.#status !== 'pending') {
      throw new Error(`Cannot complete payment in status: ${this.#status}`);
    }
    return new Payment({
      ...this.#toObject(),
      transactionReference,
      status: 'completed',
      processedAt: new Date(),
    });
  }

  fail() {
    if (this.#status !== 'pending') {
      throw new Error(`Cannot fail payment in status: ${this.#status}`);
    }
    return new Payment({
      ...this.#toObject(),
      status: 'failed',
      processedAt: new Date(),
    });
  }

  refund() {
    if (this.#status !== 'completed') {
      throw new Error(`Cannot refund payment in status: ${this.#status}`);
    }
    return new Payment({
      ...this.#toObject(),
      status: 'refunded',
      processedAt: new Date(),
    });
  }

  #toObject() {
    return {
      paymentId: this.#paymentId,
      orderId: this.#orderId,
      paymentMethod: this.#paymentMethod,
      transactionReference: this.#transactionReference,
      amount: this.#amount,
      status: this.#status,
      processedAt: this.#processedAt,
    };
  }

  toDTO() {
    return {
      paymentId: this.#paymentId,
      orderId: this.#orderId,
      paymentMethod: this.#paymentMethod,
      transactionReference: this.#transactionReference,
      amount: this.#amount.toDTO().amount,
      status: this.#status,
      processedAt: this.#processedAt instanceof Date ? this.#processedAt.toISOString() : this.#processedAt,
    };
  }

  toJSON() {
    return this.toDTO();
  }

  static fromDTO(dto) {
    return new Payment({
      paymentId: dto.paymentId,
      orderId: dto.orderId,
      paymentMethod: dto.paymentMethod,
      transactionReference: dto.transactionReference,
      amount: dto.amount,
      status: dto.status,
      processedAt: dto.processedAt ? new Date(dto.processedAt) : null,
    });
  }
}

module.exports = Payment;
