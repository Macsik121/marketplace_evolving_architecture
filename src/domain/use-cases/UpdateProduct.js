'use strict';

/**
 * @class UpdateProduct
 * @description Use case for updating product details
 */
class UpdateProduct {
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
   * @param {number} params.productId - Product ID to update
   * @param {number} params.sellerId - Seller performing the update
   * @param {Object} params.updates - Fields to update
   * @returns {Promise<{success: boolean, product?: object, error?: string}>}
   */
  async execute({ productId, sellerId, updates }) {
    // Input validation
    if (!productId || typeof productId !== 'number') {
      return { success: false, error: 'Invalid product ID' };
    }
    if (!sellerId || typeof sellerId !== 'number') {
      return { success: false, error: 'Invalid seller ID' };
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

    // Apply updates
    const updatedProduct = product.updateDetails({
      title: updates.title,
      description: updates.description,
    });

    // Handle price update
    let finalProduct = updatedProduct;
    if (updates.price !== undefined) {
      finalProduct = updatedProduct.updatePrice(updates.price);
    }

    // Save
    const saved = await this.#productRepository.save(finalProduct);
    return { success: true, product: saved.toDTO() };
  }
}

module.exports = UpdateProduct;
