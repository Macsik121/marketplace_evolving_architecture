'use strict';

/**
 * @class ListOrders
 * @description Use case for listing orders for a user
 */
class ListOrders {
  #orderRepository;
  #userRepository;

  constructor({ orderRepository, userRepository }) {
    if (!orderRepository) {
      throw new TypeError('orderRepository is required');
    }
    if (!userRepository) {
      throw new TypeError('userRepository is required');
    }
    this.#orderRepository = orderRepository;
    this.#userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {Object} params
   * @param {number} params.buyerId - Buyer ID
   * @param {string} [params.status] - Filter by status
   * @returns {Promise<{success: boolean, orders?: object[], error?: string}>}
   */
  async execute({ buyerId, status }) {
    if (!buyerId || typeof buyerId !== 'number') {
      return { success: false, error: 'Invalid buyer ID' };
    }

    const buyer = await this.#userRepository.findById(buyerId);
    if (!buyer) {
      return { success: false, error: 'User not found' };
    }

    let orders;
    if (status) {
      orders = await this.#orderRepository.findByStatus(status);
      orders = orders.filter(o => o.buyerId === buyerId);
    } else {
      orders = await this.#orderRepository.findByBuyer(buyerId);
    }

    return {
      success: true,
      orders: orders.map(o => o.toDTO()),
      count: orders.length,
    };
  }
}

module.exports = ListOrders;
