'use strict';

/**
 * @class GetCart
 * @description Use case for retrieving user's cart with product details
 */
class GetCart {
  #cartRepository;
  #productRepository;
  #userRepository;

  constructor({ cartRepository, productRepository, userRepository }) {
    if (!cartRepository) {
      throw new TypeError('cartRepository is required');
    }
    if (!productRepository) {
      throw new TypeError('productRepository is required');
    }
    if (!userRepository) {
      throw new TypeError('userRepository is required');
    }
    this.#cartRepository = cartRepository;
    this.#productRepository = productRepository;
    this.#userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {Object} params
   * @param {number} params.userId - User ID
   * @returns {Promise<{success: boolean, cart?: object, error?: string}>}
   */
  async execute({ userId }) {
    if (!userId || typeof userId !== 'number') {
      return { success: false, error: 'Invalid user ID' };
    }

    // Verify user exists
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Get cart items
    const cartItems = await this.#cartRepository.findByUser(userId);

    // Enrich with product details
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      const product = await this.#productRepository.findById(item.productId);
      if (product) {
        const subtotal = product.price.amount * item.quantity;
        totalAmount += subtotal;

        enrichedItems.push({
          ...item.toDTO(),
          product: {
            productId: product.productId,
            title: product.title,
            price: product.price.amount,
            stock: product.stock.value,
          },
          subtotal,
        });
      }
    }

    return {
      success: true,
      cart: {
        items: enrichedItems,
        totalAmount,
        itemCount: enrichedItems.length,
      },
    };
  }
}

module.exports = GetCart;
