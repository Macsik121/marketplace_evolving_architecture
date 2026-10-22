'use strict';

/**
 * @class GetProductReviews
 * @description Use case for retrieving reviews for a product
 */
class GetProductReviews {
  #reviewRepository;
  #productRepository;

  constructor({ reviewRepository, productRepository }) {
    if (!reviewRepository) {
      throw new TypeError('reviewRepository is required');
    }
    if (!productRepository) {
      throw new TypeError('productRepository is required');
    }
    this.#reviewRepository = reviewRepository;
    this.#productRepository = productRepository;
  }

  /**
   * Execute the use case
   * @param {Object} params
   * @param {number} params.productId - Product ID
   * @returns {Promise<{success: boolean, reviews?: object[], stats?: object, error?: string}>}
   */
  async execute({ productId }) {
    if (!productId || typeof productId !== 'number') {
      return { success: false, error: 'Invalid product ID' };
    }

    // Verify product exists
    const product = await this.#productRepository.findById(productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Get reviews
    const reviews = await this.#reviewRepository.findByProduct(productId);

    // Get statistics
    const avgRating = await this.#reviewRepository.getAverageRating(productId);
    const count = await this.#reviewRepository.countByProduct(productId);

    return {
      success: true,
      reviews: reviews.map(r => r.toDTO()),
      stats: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: count,
        ratingDistribution: this.#calculateDistribution(reviews),
      },
    };
  }

  #calculateDistribution(reviews) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of reviews) {
      distribution[review.rating]++;
    }
    return distribution;
  }
}

module.exports = GetProductReviews;
