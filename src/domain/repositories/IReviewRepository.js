'use strict';

/**
 * @interface IReviewRepository
 * @description Repository contract for Review persistence
 */
class IReviewRepository {
  /**
   * Find review by ID
   * @param {number} reviewId
   * @returns {Promise<Review|null>}
   */
  async findById(reviewId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all reviews for a product
   * @param {number} productId
   * @returns {Promise<Review[]>}
   */
  async findByProduct(productId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all reviews by a buyer
   * @param {number} buyerId
   * @returns {Promise<Review[]>}
   */
  async findByBuyer(buyerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find review by buyer and product (unique constraint)
   * @param {number} buyerId
   * @param {number} productId
   * @returns {Promise<Review|null>}
   */
  async findByBuyerAndProduct(buyerId, productId) {
    throw new Error('Method not implemented');
  }

  /**
   * Save review to repository
   * @param {Review} review
   * @returns {Promise<Review>}
   */
  async save(review) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete review from repository
   * @param {number} reviewId
   * @returns {Promise<boolean>}
   */
  async delete(reviewId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get average rating for a product
   * @param {number} productId
   * @returns {Promise<number>}
   */
  async getAverageRating(productId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get review count for a product
   * @param {number} productId
   * @returns {Promise<number>}
   */
  async countByProduct(productId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IReviewRepository;
