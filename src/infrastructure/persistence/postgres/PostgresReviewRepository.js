'use strict';

const IReviewRepository = require('../../../domain/repositories/IReviewRepository');
const Review = require('../../../domain/entities/Review');

class PostgresReviewRepository extends IReviewRepository {
  #pool;

  constructor(pool) {
    super();
    this.#pool = pool;
  }

  async findById(reviewId) {
    const result = await this.#pool.query(
      'SELECT * FROM reviews WHERE review_id = $1',
      [reviewId]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async findByProduct(productId) {
    const result = await this.#pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
      [productId]
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  async findByBuyer(buyerId) {
    const result = await this.#pool.query(
      'SELECT * FROM reviews WHERE buyer_id = $1 ORDER BY created_at DESC',
      [buyerId]
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  async findByBuyerAndProduct(buyerId, productId) {
    const result = await this.#pool.query(
      'SELECT * FROM reviews WHERE buyer_id = $1 AND product_id = $2',
      [buyerId, productId]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async save(review) {
    const dto = review.toDTO();
    const result = await this.#pool.query(
      `INSERT INTO reviews (product_id, buyer_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [dto.productId, dto.buyerId, dto.rating, dto.comment]
    );
    return this.#mapToEntity(result.rows[0]);
  }

  async delete(reviewId) {
    const result = await this.#pool.query(
      'DELETE FROM reviews WHERE review_id = $1',
      [reviewId]
    );
    return result.rowCount > 0;
  }

  async getAverageRating(productId) {
    const result = await this.#pool.query(
      'SELECT AVG(rating)::numeric(3,2) as avg FROM reviews WHERE product_id = $1',
      [productId]
    );
    return parseFloat(result.rows[0].avg) || 0;
  }

  async countByProduct(productId) {
    const result = await this.#pool.query(
      'SELECT COUNT(*)::int as count FROM reviews WHERE product_id = $1',
      [productId]
    );
    return result.rows[0].count;
  }

  #mapToEntity(row) {
    return new Review({
      reviewId: row.review_id,
      productId: row.product_id,
      buyerId: row.buyer_id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
    });
  }
}

module.exports = PostgresReviewRepository;
