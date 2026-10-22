'use strict';

/**
 * @interface ICartRepository
 * @description Repository contract for CartItem persistence
 */
class ICartRepository {
  /**
   * Find cart item by user and product
   * @param {number} userId
   * @param {number} productId
   * @returns {Promise<CartItem|null>}
   */
  async findByUserAndProduct(userId, productId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all cart items for a user
   * @param {number} userId
   * @returns {Promise<CartItem[]>}
   */
  async findByUser(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Add item to cart (or update quantity if exists)
   * @param {number} userId
   * @param {number} productId
   * @param {number} quantity
   * @returns {Promise<CartItem>}
   */
  async add(userId, productId, quantity) {
    throw new Error('Method not implemented');
  }

  /**
   * Update cart item quantity
   * @param {number} cartItemId
   * @param {number} quantity
   * @returns {Promise<CartItem|null>}
   */
  async updateQuantity(cartItemId, quantity) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove item from cart
   * @param {number} cartItemId
   * @returns {Promise<boolean>}
   */
  async remove(cartItemId) {
    throw new Error('Method not implemented');
  }

  /**
   * Clear all cart items for a user
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  async clearByUser(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get cart item count for a user
   * @param {number} userId
   * @returns {Promise<number>}
   */
  async countByUser(userId) {
    throw new Error('Method not implemented');
  }
}

module.exports = ICartRepository;
