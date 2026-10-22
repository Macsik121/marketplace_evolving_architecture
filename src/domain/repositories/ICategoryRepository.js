'use strict';

/**
 * @interface ICategoryRepository
 * @description Repository contract for Category persistence
 */
class ICategoryRepository {
  /**
   * Find category by ID
   * @param {number} categoryId
   * @returns {Promise<Category|null>}
   */
  async findById(categoryId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all categories
   * @returns {Promise<Category[]>}
   */
  async findAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Find child categories of a parent
   * @param {number} parentCategoryId
   * @returns {Promise<Category[]>}
   */
  async findByParent(parentCategoryId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find root categories (no parent)
   * @returns {Promise<Category[]>}
   */
  async findRoots() {
    throw new Error('Method not implemented');
  }

  /**
   * Save category to repository
   * @param {Category} category
   * @returns {Promise<Category>}
   */
  async save(category) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete category from repository
   * @param {number} categoryId
   * @returns {Promise<boolean>}
   */
  async delete(categoryId) {
    throw new Error('Method not implemented');
  }
}

module.exports = ICategoryRepository;
