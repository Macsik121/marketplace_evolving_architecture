'use strict';

const Order = require('../entities/Order');
const Money = require('../value-objects/Money');

/**
 * @class CreateOrder
 * @description Use case for creating an order from cart
 */
class CreateOrder {
  #orderRepository;
  #cartRepository;
  #productRepository;
  #userRepository;

  constructor({ orderRepository, cartRepository, productRepository, userRepository }) {
    if (!orderRepository) {
      throw new TypeError('orderRepository is required');
    }
    if (!cartRepository) {
      throw new TypeError('cartRepository is required');
    }
    if (!productRepository) {
      throw new TypeError('productRepository is required');
    }
    if (!userRepository) {
      throw new TypeError('userRepository is required');
    }
    this.#orderRepository = orderRepository;
    this.#cartRepository = cartRepository;
    this.#productRepository = productRepository;
    this.#userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {Object} params
   * @param {number} params.buyerId - Buyer ID
   * @param {string} params.shippingAddress - Shipping address
   * @returns {Promise<{success: boolean, order?: object, error?: string}>}
   */
  async execute({ buyerId, shippingAddress }) {
    // Validate buyer
    if (!buyerId || typeof buyerId !== 'number') {
      return { success: false, error: 'Invalid buyer ID' };
    }
    if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length === 0) {
      return { success: false, error: 'Shipping address is required' };
    }

    const buyer = await this.#userRepository.findById(buyerId);
    if (!buyer) {
      return { success: false, error: 'Buyer not found' };
    }
    if (!buyer.canPlaceOrders()) {
      return { success: false, error: 'User is not authorized to place orders' };
    }

    // Get cart items
    const cartItems = await this.#cartRepository.findByUser(buyerId);
    if (cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let totalAmount = 0;
    const stockUpdates = [];

    for (const item of cartItems) {
      const product = await this.#productRepository.findById(item.productId);
      if (!product) {
        return { success: false, error: `Product ${item.productId} not found` };
      }
      if (!product.isAvailable(item.quantity)) {
        return {
          success: false,
          error: `Insufficient stock for "${product.title}". Available: ${product.stock.value}, Requested: ${item.quantity}`
        };
      }

      orderItems.push({
        productId: product.productId,
        quantity: item.quantity,
        priceAtPurchase: product.price.amount,
      });

      totalAmount += product.price.amount * item.quantity;
      stockUpdates.push({
        productId: product.productId,
        newStock: product.stock.value - item.quantity,
      });
    }

    // Create order entity
    const order = new Order({
      orderId: null,
      buyerId,
      items: orderItems,
      status: 'pending',
      totalAmount,
      shippingAddress,
      createdAt: new Date(),
    });

    // Save order, update stock and clear cart in a single transaction
    const client = await this.#orderRepository.getClient();

    try {
      await client.query('BEGIN');

      // Save order in transaction
      const savedOrder = await this.#orderRepository.saveInTransaction(client, order);

      // Update stock for all products in transaction
      for (const update of stockUpdates) {
        await this.#productRepository.updateStockInTransaction(client, update.productId, update.newStock);
      }

      // Clear cart in transaction
      await this.#cartRepository.clearByUserInTransaction(client, buyerId);

      await client.query('COMMIT');

      return { success: true, order: savedOrder.toDTO() };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction failed:', error);
      return { success: false, error: 'Failed to create order. Please try again.' };
    } finally {
      client.release();
    }
  }
}

module.exports = CreateOrder;
