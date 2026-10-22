'use strict';

/**
 * @interface IOrderRepository
 * @description Repository contract for Order persistence
 */
class IOrderRepository {
  /**
   * Find order by ID
   * @param {number} orderId
   * @returns {Promise<Order|null>}
   */
  async findById(orderId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all orders by buyer ID
   * @param {number} buyerId
   * @returns {Promise<Order[]>}
   */
  async findByBuyer(buyerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find orders by status
   * @param {string} status
   * @returns {Promise<Order[]>}
   */
  async findByStatus(status) {
    throw new Error('Method not implemented');
  }

  /**
   * Save order to repository
   * @param {Order} order
   * @returns {Promise<Order>}
   */
  async save(order) {
    throw new Error('Method not implemented');
  }

  /**
   * Update order status
   * @param {number} orderId
   * @param {string} status
   * @returns {Promise<boolean>}
   */
  async updateStatus(orderId, status) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete order from repository
   * @param {number} orderId
   * @returns {Promise<boolean>}
   */
  async delete(orderId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IOrderRepository;
