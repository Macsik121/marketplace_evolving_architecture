'use strict';

class Category {
  #categoryId;
  #name;
  #parentCategoryId;

  constructor({ categoryId, name, parentCategoryId }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Category name is required and must be a non-empty string');
    }

    this.#categoryId = categoryId;
    this.#name = name.trim();
    this.#parentCategoryId = parentCategoryId || null;
    Object.freeze(this);
  }

  get categoryId() { return this.#categoryId; }
  get name() { return this.#name; }
  get parentCategoryId() { return this.#parentCategoryId; }

  isRoot() {
    return this.#parentCategoryId === null;
  }

  isChildOf(parentId) {
    return this.#parentCategoryId === parentId;
  }

  toDTO() {
    return {
      categoryId: this.#categoryId,
      name: this.#name,
      parentCategoryId: this.#parentCategoryId,
    };
  }

  toJSON() {
    return this.toDTO();
  }

  static fromDTO(dto) {
    return new Category({
      categoryId: dto.categoryId,
      name: dto.name,
      parentCategoryId: dto.parentCategoryId,
    });
  }
}

module.exports = Category;
