'use strict';

/**
 * @class GetOrder
 * @description Use case for retrieving a single order by ID
 */
class GetOrder {
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
   * @param {number} params.orderId - Order ID
   * @param {number} params.userId - User ID requesting the order
   * @returns {Promise<{success: boolean, order?: object, error?: string}>}
   */
  async execute({ orderId, userId }) {
    if (!orderId || typeof orderId !== 'number') {
      return { success: false, error: 'Invalid order ID' };
    }
    if (!userId || typeof userId !== 'number') {
      return { success: false, error: 'Invalid user ID' };
    }

    const order = await this.#orderRepository.findById(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Verify user has access (buyer or admin)
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (order.buyerId !== userId && !user.isAdmin()) {
      return { success: false, error: 'Not authorized to view this order' };
    }

    return { success: true, order: order.toDTO() };
  }
}

module.exports = GetOrder;
