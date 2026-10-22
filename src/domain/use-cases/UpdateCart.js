'use strict';

/**
 * @class UpdateCart
 * @description Use case for updating cart item quantity
 */
class UpdateCart {
  #cartRepository;
  #productRepository;
  #userRepository;

  constructor({ cartRepository, productRepository, userRepository }) {
    if (!cartRepository) {
      throw new TypeError('cartRepository is required');
    }
    if (!productRepository) {
      throw new TypeError('productRepository is required');
    }
    if (!userRepository) {
      throw new TypeError('userRepository is required');
    }
    this.#cartRepository = cartRepository;
    this.#productRepository = productRepository;
    this.#userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {Object} params
   * @param {number} params.userId - User ID
   * @param {number} params.productId - Product ID
   * @param {number} params.quantity - New quantity (must be > 0)
   * @returns {Promise<{success: boolean, cartItem?: object, error?: string}>}
   */
  async execute({ userId, productId, quantity }) {
    // Input validation
    if (!userId || typeof userId !== 'number') {
      return { success: false, error: 'Invalid user ID' };
    }
    if (!productId || typeof productId !== 'number') {
      return { success: false, error: 'Invalid product ID' };
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { success: false, error: 'Quantity must be a positive integer' };
    }

    // Verify user exists
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify product exists and has stock
    const product = await this.#productRepository.findById(productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    if (!product.isAvailable(quantity)) {
      return { success: false, error: `Insufficient stock. Available: ${product.stock.value}, Requested: ${quantity}` };
    }

    // Check if cart item exists
    const existingItem = await this.#cartRepository.findByUserAndProduct(userId, productId);
    if (!existingItem) {
      return { success: false, error: 'Cart item not found' };
    }

    // Update quantity
    const updated = await this.#cartRepository.updateQuantity(existingItem.cartItemId, quantity);
    return { success: true, cartItem: updated.toDTO() };
  }
}

module.exports = UpdateCart;
