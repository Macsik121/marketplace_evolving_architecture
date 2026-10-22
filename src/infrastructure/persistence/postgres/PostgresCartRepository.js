'use strict';

const ICartRepository = require('../../../domain/repositories/ICartRepository');
const CartItem = require('../../../domain/entities/CartItem');

class PostgresCartRepository extends ICartRepository {
  #pool;

  constructor(pool) {
    super();
    this.#pool = pool;
  }

  async findByUserAndProduct(userId, productId) {
    const result = await this.#pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async findByUser(userId) {
    const result = await this.#pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  async add(userId, productId, quantity) {
    const existing = await this.findByUserAndProduct(userId, productId);

    if (existing) {
      const result = await this.#pool.query(
        `UPDATE cart_items
         SET quantity = $1, updated_at = NOW()
         WHERE user_id = $2 AND product_id = $3
         RETURNING *`,
        [quantity, userId, productId]
      );
      return this.#mapToEntity(result.rows[0]);
    }

    const result = await this.#pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, productId, quantity]
    );
    return this.#mapToEntity(result.rows[0]);
  }

  async updateQuantity(cartItemId, quantity) {
    const result = await this.#pool.query(
      `UPDATE cart_items
       SET quantity = $1, updated_at = NOW()
       WHERE cart_item_id = $2
       RETURNING *`,
      [quantity, cartItemId]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async remove(cartItemId) {
    const result = await this.#pool.query(
      'DELETE FROM cart_items WHERE cart_item_id = $1',
      [cartItemId]
    );
    return result.rowCount > 0;
  }

  async clearByUser(userId) {
    const result = await this.#pool.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );
    return result.rowCount > 0;
  }

  async countByUser(userId) {
    const result = await this.#pool.query(
      'SELECT COUNT(*)::int as count FROM cart_items WHERE user_id = $1',
      [userId]
    );
    return result.rows[0].count;
  }

  #mapToEntity(row) {
    return new CartItem({
      cartItemId: row.cart_item_id,
      userId: row.user_id,
      productId: row.product_id,
      quantity: row.quantity,
      updatedAt: row.updated_at,
    });
  }
}

module.exports = PostgresCartRepository;
