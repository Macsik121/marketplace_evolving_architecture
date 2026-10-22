'use strict';

const IOrderRepository = require('../../../domain/repositories/IOrderRepository');
const Order = require('../../../domain/entities/Order');
const OrderItem = require('../../../domain/entities/OrderItem');

class PostgresOrderRepository extends IOrderRepository {
  #pool;

  constructor(pool) {
    super();
    this.#pool = pool;
  }

  async findById(orderId) {
    const orderResult = await this.#pool.query(
      'SELECT * FROM orders WHERE order_id = $1',
      [orderId]
    );
    if (orderResult.rows.length === 0) return null;

    const orderRow = orderResult.rows[0];
    const itemsResult = await this.#pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );

    const items = itemsResult.rows.map(row => new OrderItem({
      orderItemId: row.order_item_id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      priceAtPurchase: parseFloat(row.price_at_purchase),
    }));

    return new Order({
      orderId: orderRow.order_id,
      buyerId: orderRow.buyer_id,
      items,
      status: orderRow.status,
      totalAmount: parseFloat(orderRow.total_amount),
      shippingAddress: orderRow.shipping_address,
      createdAt: orderRow.created_at,
    });
  }

  async findByBuyer(buyerId) {
    const ordersResult = await this.#pool.query(
      'SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_at DESC',
      [buyerId]
    );

    const orders = [];
    for (const orderRow of ordersResult.rows) {
      const itemsResult = await this.#pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [orderRow.order_id]
      );

      const items = itemsResult.rows.map(row => new OrderItem({
        orderItemId: row.order_item_id,
        orderId: row.order_id,
        productId: row.product_id,
        quantity: row.quantity,
        priceAtPurchase: parseFloat(row.price_at_purchase),
      }));

      orders.push(new Order({
        orderId: orderRow.order_id,
        buyerId: orderRow.buyer_id,
        items,
        status: orderRow.status,
        totalAmount: parseFloat(orderRow.total_amount),
        shippingAddress: orderRow.shipping_address,
        createdAt: orderRow.created_at,
      }));
    }

    return orders;
  }

  async findByStatus(status) {
    const ordersResult = await this.#pool.query(
      'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );

    const orders = [];
    for (const orderRow of ordersResult.rows) {
      const itemsResult = await this.#pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [orderRow.order_id]
      );

      const items = itemsResult.rows.map(row => new OrderItem({
        orderItemId: row.order_item_id,
        orderId: row.order_id,
        productId: row.product_id,
        quantity: row.quantity,
        priceAtPurchase: parseFloat(row.price_at_purchase),
      }));

      orders.push(new Order({
        orderId: orderRow.order_id,
        buyerId: orderRow.buyer_id,
        items,
        status: orderRow.status,
        totalAmount: parseFloat(orderRow.total_amount),
        shippingAddress: orderRow.shipping_address,
        createdAt: orderRow.created_at,
      }));
    }

    return orders;
  }

  async save(order) {
    const dto = order.toDTO();

    const client = await this.#pool.connect();
    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `INSERT INTO orders (buyer_id, total_amount, status, shipping_address)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [dto.buyerId, dto.totalAmount, dto.status, dto.shippingAddress]
      );

      const savedOrderId = orderResult.rows[0].order_id;

      for (const item of dto.items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
           VALUES ($1, $2, $3, $4)`,
          [savedOrderId, item.productId, item.quantity, item.priceAtPurchase]
        );
      }

      await client.query('COMMIT');

      return await this.findById(savedOrderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStatus(orderId, status) {
    const result = await this.#pool.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2',
      [status, orderId]
    );
    return result.rowCount > 0;
  }

  async delete(orderId) {
    const result = await this.#pool.query(
      'DELETE FROM orders WHERE order_id = $1',
      [orderId]
    );
    return result.rowCount > 0;
  }
}

module.exports = PostgresOrderRepository;
