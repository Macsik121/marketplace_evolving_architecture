'use strict';

/**
 * @class UpdateOrderStatus
 * @description Use case for updating order status
 */
class UpdateOrderStatus {
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
   * @param {number} params.userId - User performing the update
   * @param {string} params.newStatus - New status
   * @returns {Promise<{success: boolean, order?: object, error?: string}>}
   */
  async execute({ orderId, userId, newStatus }) {
    if (!orderId || typeof orderId !== 'number') {
      return { success: false, error: 'Invalid order ID' };
    }
    if (!userId || typeof userId !== 'number') {
      return { success: false, error: 'Invalid user ID' };
    }
    if (!newStatus || typeof newStatus !== 'string') {
      return { success: false, error: 'Invalid status' };
    }

    // Verify user exists
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Get order
    const order = await this.#orderRepository.findById(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Check authorization
    // - Buyer can cancel pending orders
    // - Admin can update any order status
    if (!user.isAdmin()) {
      if (order.buyerId !== userId) {
        return { success: false, error: 'Not authorized to update this order' };
      }
      if (newStatus !== 'cancelled') {
        return { success: false, error: 'Buyers can only cancel orders' };
      }
    }

    // Transition status
    const updatedOrder = order.transitionTo(newStatus);
    await this.#orderRepository.updateStatus(orderId, newStatus);

    return { success: true, order: updatedOrder.toDTO() };
  }
}

module.exports = UpdateOrderStatus;
