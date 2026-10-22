'use strict';

const Money = require('../value-objects/Money');
const StockQuantity = require('../value-objects/StockQuantity');
const ProductSku = require('../value-objects/ProductSku');

class Product {
  #productId;
  #sellerId;
  #categoryId;
  #title;
  #description;
  #price;
  #stock;
  #sku;
  #createdAt;

  constructor({ productId, sellerId, categoryId, title, description, price, stock, sku, createdAt }) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new Error('Product title is required and must be a non-empty string');
    }

    this.#productId = productId;
    this.#sellerId = sellerId;
    this.#categoryId = categoryId;
    this.#title = title.trim();
    this.#description = description || null;
    this.#price = price instanceof Money ? price : new Money(price);
    this.#stock = stock instanceof StockQuantity ? stock : new StockQuantity(stock ?? 0);
    this.#sku = sku instanceof ProductSku ? sku : new ProductSku(sku);
    this.#createdAt = createdAt || new Date();
    Object.freeze(this);
  }

  get productId() { return this.#productId; }
  get sellerId() { return this.#sellerId; }
  get categoryId() { return this.#categoryId; }
  get title() { return this.#title; }
  get description() { return this.#description; }
  get price() { return this.#price; }
  get stock() { return this.#stock; }
  get sku() { return this.#sku; }
  get createdAt() { return this.#createdAt; }

  isAvailable(quantity) {
    return this.#stock.isAvailable(quantity);
  }

  decreaseStock(quantity) {
    const newStock = this.#stock.decrease(quantity);
    return new Product({
      ...this.#toObject(),
      stock: newStock,
    });
  }

  increaseStock(quantity) {
    const newStock = this.#stock.increase(quantity);
    return new Product({
      ...this.#toObject(),
      stock: newStock,
    });
  }

  updatePrice(newPrice) {
    return new Product({
      ...this.#toObject(),
      price: newPrice instanceof Money ? newPrice : new Money(newPrice),
    });
  }

  updateDetails({ title, description }) {
    return new Product({
      ...this.#toObject(),
      title: title ?? this.#title,
      description: description ?? this.#description,
    });
  }

  #toObject() {
    return {
      productId: this.#productId,
      sellerId: this.#sellerId,
      categoryId: this.#categoryId,
      title: this.#title,
      description: this.#description,
      price: this.#price,
      stock: this.#stock,
      sku: this.#sku,
      createdAt: this.#createdAt,
    };
  }

  toDTO() {
    return {
      productId: this.#productId,
      sellerId: this.#sellerId,
      categoryId: this.#categoryId,
      title: this.#title,
      description: this.#description,
      price: this.#price.toDTO().amount,
      stock: this.#stock.toDTO(),
      sku: this.#sku.toDTO(),
      createdAt: this.#createdAt instanceof Date ? this.#createdAt.toISOString() : this.#createdAt,
    };
  }

  toJSON() {
    return this.toDTO();
  }

  static fromDTO(dto) {
    return new Product({
      productId: dto.productId,
      sellerId: dto.sellerId,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
      sku: dto.sku,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
    });
  }
}

module.exports = Product;
