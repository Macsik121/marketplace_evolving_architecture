'use strict';

const ICategoryRepository = require('../../../domain/repositories/ICategoryRepository');
const Category = require('../../../domain/entities/Category');

class PostgresCategoryRepository extends ICategoryRepository {
  #pool;

  constructor(pool) {
    super();
    this.#pool = pool;
  }

  async findById(categoryId) {
    const result = await this.#pool.query(
      'SELECT * FROM categories WHERE category_id = $1',
      [categoryId]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async findAll() {
    const result = await this.#pool.query(
      'SELECT * FROM categories ORDER BY name'
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  async findByParent(parentCategoryId) {
    const result = await this.#pool.query(
      'SELECT * FROM categories WHERE parent_category_id = $1 ORDER BY name',
      [parentCategoryId]
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  async findRoots() {
    const result = await this.#pool.query(
      'SELECT * FROM categories WHERE parent_category_id IS NULL ORDER BY name'
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  async save(category) {
    const dto = category.toDTO();
    const result = await this.#pool.query(
      `INSERT INTO categories (name, parent_category_id)
       VALUES ($1, $2)
       RETURNING *`,
      [dto.name, dto.parentCategoryId]
    );
    return this.#mapToEntity(result.rows[0]);
  }

  async delete(categoryId) {
    const result = await this.#pool.query(
      'DELETE FROM categories WHERE category_id = $1',
      [categoryId]
    );
    return result.rowCount > 0;
  }

  #mapToEntity(row) {
    return new Category({
      categoryId: row.category_id,
      name: row.name,
      parentCategoryId: row.parent_category_id,
    });
  }
}

module.exports = PostgresCategoryRepository;
