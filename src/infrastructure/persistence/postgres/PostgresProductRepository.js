'use strict';

const IProductRepository = require('../../../domain/repositories/IProductRepository');
const Product = require('../../../domain/entities/Product');

class PostgresProductRepository extends IProductRepository {
  #pool;

  constructor(pool) {
    super();
    this.#pool = pool;
  }

  async findById(productId) {
    const result = await this.#pool.query(
      'SELECT * FROM products WHERE product_id = $1',
      [productId]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async findBySku(sku) {
    const result = await this.#pool.query(
      'SELECT * FROM products WHERE sku = $1',
      [sku]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async findBySeller(sellerId) {
    const result = await this.#pool.query(
      'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
      [sellerId]
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  async findByCategory(categoryId) {
    const result = await this.#pool.query(
      'SELECT * FROM products WHERE category_id = $1 ORDER BY created_at DESC',
      [categoryId]
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  async save(product) {
    const dto = product.toDTO();
    const result = await this.#pool.query(
      `INSERT INTO products (seller_id, category_id, title, description, price, stock_quantity, sku)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [dto.sellerId, dto.categoryId, dto.title, dto.description, dto.price, dto.stock, dto.sku]
    );
    return this.#mapToEntity(result.rows[0]);
  }

  async updateStock(productId, newStock) {
    const result = await this.#pool.query(
      'UPDATE products SET stock_quantity = $1 WHERE product_id = $2',
      [newStock, productId]
    );
    return result.rowCount > 0;
  }

  async delete(productId) {
    const result = await this.#pool.query(
      'DELETE FROM products WHERE product_id = $1',
      [productId]
    );
    return result.rowCount > 0;
  }

  async findAll(limit = 50, offset = 0) {
    const result = await this.#pool.query(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  async searchByTitle(query) {
    const result = await this.#pool.query(
      'SELECT * FROM products WHERE title ILIKE $1 ORDER BY created_at DESC',
      [`%${query}%`]
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  #mapToEntity(row) {
    return new Product({
      productId: row.product_id,
      sellerId: row.seller_id,
      categoryId: row.category_id,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      stock: row.stock_quantity,
      sku: row.sku,
      createdAt: row.created_at,
    });
  }
}

module.exports = PostgresProductRepository;
