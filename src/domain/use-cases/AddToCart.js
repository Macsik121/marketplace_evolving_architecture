'use strict';

/**
 * @class AddToCart
 * @description Use case for adding a product to user's cart
 */
class AddToCart {
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
   * @param {number} [params.quantity] - Quantity to add (default: 1)
   * @returns {Promise<{success: boolean, cartItem?: object, error?: string}>}
   */
  async execute({ userId, productId, quantity = 1 }) {
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

    // Check existing cart item
    const existingItem = await this.#cartRepository.findByUserAndProduct(userId, productId);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (!product.isAvailable(newQuantity)) {
      return {
        success: false,
        error: `Insufficient stock. Available: ${product.stock.value}, Requested: ${newQuantity}`
      };
    }

    // Add or update cart item
    const cartItem = await this.#cartRepository.add(userId, productId, newQuantity);
    return { success: true, cartItem: cartItem.toDTO() };
  }
}

module.exports = AddToCart;
