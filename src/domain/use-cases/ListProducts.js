'use strict';

/**
 * @class ListProducts
 * @description Use case for listing products with filters
 */
class ListProducts {
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
   * @param {number} [params.categoryId] - Filter by category
   * @param {number} [params.sellerId] - Filter by seller
   * @param {string} [params.search] - Search by title
   * @param {number} [params.limit] - Pagination limit
   * @param {number} [params.offset] - Pagination offset
   * @returns {Promise<{success: boolean, products?: object[], error?: string}>}
   */
  async execute({ categoryId, sellerId, search, limit = 50, offset = 0 } = {}) {
    let products;

    if (search) {
      products = await this.#productRepository.searchByTitle(search);
    } else if (categoryId) {
      products = await this.#productRepository.findByCategory(categoryId);
    } else if (sellerId) {
      products = await this.#productRepository.findBySeller(sellerId);
    } else {
      products = await this.#productRepository.findAll(limit, offset);
    }

    return {
      success: true,
      products: products.map(p => p.toDTO()),
      count: products.length,
    };
  }
}

module.exports = ListProducts;
