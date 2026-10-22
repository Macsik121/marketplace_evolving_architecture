'use strict';

/**
 * @class GetProduct
 * @description Use case for retrieving a single product by ID
 */
class GetProduct {
  #productRepository;

  constructor({ productRepository }) {
    if (!productRepository) {
      throw new TypeError('productRepository is required');
    }
    this.#productRepository = productRepository;
  }

  /**
   * Execute the use case
   * @param {Object} params
   * @param {number} params.productId - Product ID
   * @returns {Promise<{success: boolean, product?: object, error?: string}>}
   */
  async execute({ productId }) {
    if (!productId || typeof productId !== 'number') {
      return { success: false, error: 'Invalid product ID' };
    }

    const product = await this.#productRepository.findById(productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    return { success: true, product: product.toDTO() };
  }
}

module.exports = GetProduct;
