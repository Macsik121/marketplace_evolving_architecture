'use strict';

/**
 * @class RemoveFromCart
 * @description Use case for removing an item from cart
 */
class RemoveFromCart {
  #cartRepository;
  #userRepository;

  constructor({ cartRepository, userRepository }) {
    if (!cartRepository) {
      throw new TypeError('cartRepository is required');
    }
    if (!userRepository) {
      throw new TypeError('userRepository is required');
    }
    this.#cartRepository = cartRepository;
    this.#userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {Object} params
   * @param {number} params.userId - User ID
   * @param {number} params.productId - Product ID to remove
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async execute({ userId, productId }) {
    // Input validation
    if (!userId || typeof userId !== 'number') {
      return { success: false, error: 'Invalid user ID' };
    }
    if (!productId || typeof productId !== 'number') {
      return { success: false, error: 'Invalid product ID' };
    }

    // Verify user exists
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Find cart item
    const cartItem = await this.#cartRepository.findByUserAndProduct(userId, productId);
    if (!cartItem) {
      return { success: false, error: 'Cart item not found' };
    }

    // Remove from cart
    await this.#cartRepository.remove(cartItem.cartItemId);
    return { success: true };
  }
}

module.exports = RemoveFromCart;
