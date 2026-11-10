'use strict';

const Review = require('../entities/Review');

/**
 * @class CreateReview
 * @description Use case for creating a product review
 */
class CreateReview {
  #reviewRepository;
  #productRepository;
  #userRepository;
  #orderRepository;

  constructor({ reviewRepository, productRepository, userRepository, orderRepository }) {
    if (!reviewRepository) {
      throw new TypeError('reviewRepository is required');
    }
    if (!productRepository) {
      throw new TypeError('productRepository is required');
    }
    if (!userRepository) {
      throw new TypeError('userRepository is required');
    }
    if (!orderRepository) {
      throw new TypeError('orderRepository is required');
    }
    this.#reviewRepository = reviewRepository;
    this.#productRepository = productRepository;
    this.#userRepository = userRepository;
    this.#orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   * @param {Object} params
   * @param {number} params.buyerId - Buyer ID creating the review
   * @param {number} params.productId - Product ID
   * @param {number} params.rating - Rating (1-5)
   * @param {string} [params.comment] - Review comment
   * @returns {Promise<{success: boolean, review?: object, error?: string}>}
   */
  async execute({ buyerId, productId, rating, comment }) {
    // Input validation
    if (!buyerId || typeof buyerId !== 'number' || buyerId <= 0) {
      return { success: false, error: 'Invalid buyer ID' };
    }
    if (!productId || typeof productId !== 'number' || productId <= 0) {
      return { success: false, error: 'Invalid product ID' };
    }
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be a number between 1 and 5' };
    }
    if (comment !== undefined && (typeof comment !== 'string' || comment.length > 2000)) {
      return { success: false, error: 'Comment must be a string under 2000 characters' };
    }

    // Verify buyer exists
    const buyer = await this.#userRepository.findById(buyerId);
    if (!buyer) {
      return { success: false, error: 'Buyer not found' };
    }

    // Verify product exists
    const product = await this.#productRepository.findById(productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Check if buyer already reviewed this product
    const existingReview = await this.#reviewRepository.findByBuyerAndProduct(buyerId, productId);
    if (existingReview) {
      return { success: false, error: 'You have already reviewed this product' };
    }

    // Verify buyer purchased this product (check orders)
    const buyerOrders = await this.#orderRepository.findByBuyer(buyerId);
    const hasPurchased = buyerOrders.some(order =>
      order.status !== 'cancelled' &&
      order.items.some(item => item.productId === productId)
    );
    if (!hasPurchased) {
      return { success: false, error: 'You can only review products you have purchased' };
    }

    // Create review
    const review = new Review({
      reviewId: null,
      productId,
      buyerId,
      rating,
      comment,
      createdAt: new Date(),
    });

    const saved = await this.#reviewRepository.save(review);
    return { success: true, review: saved.toDTO() };
  }
}

module.exports = CreateReview;
