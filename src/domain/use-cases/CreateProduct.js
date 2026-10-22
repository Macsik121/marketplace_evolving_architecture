'use strict';

const Product = require('../entities/Product');

/**
 * @class CreateProduct
 * @description Use case for creating a new product
 */
class CreateProduct {
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
   * @param {number} params.sellerId - Seller ID creating the product
   * @param {number} [params.categoryId] - Category ID
   * @param {string} params.title - Product title
   * @param {string} [params.description] - Product description
   * @param {number} params.price - Product price
   * @param {number} [params.stock] - Initial stock quantity
   * @param {string} params.sku - Product SKU
   * @returns {Promise<{success: boolean, product?: object, error?: string}>}
   */
  async execute({ sellerId, categoryId, title, description, price, stock = 0, sku }) {
    // Validate seller exists and is a seller
    const seller = await this.#userRepository.findById(sellerId);
    if (!seller) {
      return { success: false, error: 'Seller not found' };
    }
    if (!seller.canCreateProducts()) {
      return { success: false, error: 'User is not authorized to create products' };
    }

    // Check SKU uniqueness
    const existing = await this.#productRepository.findBySku(sku);
    if (existing) {
      return { success: false, error: 'Product with this SKU already exists' };
    }

    // Create product entity
    const product = new Product({
      productId: null,
      sellerId,
      categoryId,
      title,
      description,
      price,
      stock,
      sku,
      createdAt: new Date(),
    });

    // Save product
    const saved = await this.#productRepository.save(product);
    return { success: true, product: saved.toDTO() };
  }
}

module.exports = CreateProduct;
