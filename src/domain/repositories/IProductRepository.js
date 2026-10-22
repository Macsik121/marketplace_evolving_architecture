'use strict';

/**
 * @interface IProductRepository
 * @description Repository contract for Product persistence
 */
class IProductRepository {
  /**
   * Find product by ID
   * @param {number} productId
   * @returns {Promise<Product|null>}
   */
  async findById(productId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find product by SKU
   * @param {string} sku
   * @returns {Promise<Product|null>}
   */
  async findBySku(sku) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all products by seller ID
   * @param {number} sellerId
   * @returns {Promise<Product[]>}
   */
  async findBySeller(sellerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all products by category ID
   * @param {number} categoryId
   * @returns {Promise<Product[]>}
   */
  async findByCategory(categoryId) {
    throw new Error('Method not implemented');
  }

  /**
   * Save product to repository
   * @param {Product} product
   * @returns {Promise<Product>}
   */
  async save(product) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete product from repository
   * @param {number} productId
   * @returns {Promise<boolean>}
   */
  async delete(productId) {
    throw new Error('Method not implemented');
  }

  /**
   * Update product stock quantity
   * @param {number} productId
   * @param {number} newStock
   * @returns {Promise<boolean>}
   */
  async updateStock(productId, newStock) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all products with pagination
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<Product[]>}
   */
  async findAll(limit, offset) {
    throw new Error('Method not implemented');
  }

  /**
   * Search products by title
   * @param {string} query
   * @returns {Promise<Product[]>}
   */
  async searchByTitle(query) {
    throw new Error('Method not implemented');
  }
}

module.exports = IProductRepository;
