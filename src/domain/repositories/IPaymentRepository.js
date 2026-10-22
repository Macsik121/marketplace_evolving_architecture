'use strict';

/**
 * @interface IPaymentRepository
 * @description Repository contract for Payment persistence
 */
class IPaymentRepository {
  /**
   * Find payment by ID
   * @param {number} paymentId
   * @returns {Promise<Payment|null>}
   */
  async findById(paymentId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find payment by order ID
   * @param {number} orderId
   * @returns {Promise<Payment|null>}
   */
  async findByOrderId(orderId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find payment by transaction reference
   * @param {string} transactionReference
   * @returns {Promise<Payment|null>}
   */
  async findByTransactionReference(transactionReference) {
    throw new Error('Method not implemented');
  }

  /**
   * Save payment to repository
   * @param {Payment} payment
   * @returns {Promise<Payment>}
   */
  async save(payment) {
    throw new Error('Method not implemented');
  }

  /**
   * Update payment status
   * @param {number} paymentId
   * @param {string} status
   * @param {string} transactionReference
   * @returns {Promise<boolean>}
   */
  async updateStatus(paymentId, status, transactionReference) {
    throw new Error('Method not implemented');
  }
}

module.exports = IPaymentRepository;
