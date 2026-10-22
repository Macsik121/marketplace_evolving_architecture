'use strict';

/**
 * @class UpdateProductStock
 * @description Use case for updating product stock quantity
 */
class UpdateProductStock {
  #productRepository;
  #userRepository;

  constructor({ productRepository, userRepository }) {
    if (!productRepository) {
      throw new TypeError('productRepository is required');
    }
    if (!userRepository) {
      throw new TypeError('userRepository is required');
    }
    this.#productRepository = productRepository;
    this.#userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {Object} params
   * @param {number} params.productId - Product ID
   * @param {number} params.sellerId - Seller performing the update
   * @param {number} params.quantity - New stock quantity
   * @returns {Promise<{success: boolean, product?: object, error?: string}>}
   */
  async execute({ productId, sellerId, quantity }) {
    // Input validation
    if (!productId || typeof productId !== 'number') {
      return { success: false, error: 'Invalid product ID' };
    }
    if (!sellerId || typeof sellerId !== 'number') {
      return { success: false, error: 'Invalid seller ID' };
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      return { success: false, error: 'Stock quantity must be a non-negative integer' };
    }

    // Verify seller exists
    const seller = await this.#userRepository.findById(sellerId);
    if (!seller) {
      return { success: false, error: 'Seller not found' };
    }

    // Verify product exists and belongs to seller
    const product = await this.#productRepository.findById(productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    if (product.sellerId !== sellerId) {
      return { success: false, error: 'Not authorized to update this product' };
    }

    // Update stock
    const updated = await this.#productRepository.updateStock(productId, quantity);
    if (!updated) {
      return { success: false, error: 'Failed to update stock' };
    }

    const updatedProduct = await this.#productRepository.findById(productId);
    return { success: true, product: updatedProduct.toDTO() };
  }
}

module.exports = UpdateProductStock;
