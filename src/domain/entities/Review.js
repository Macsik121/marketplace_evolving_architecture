'use strict';

class Review {
  #reviewId;
  #productId;
  #buyerId;
  #rating;
  #comment;
  #createdAt;

  static MIN_RATING = 1;
  static MAX_RATING = 5;

  constructor({ reviewId, productId, buyerId, rating, comment, createdAt }) {
    if (!Number.isInteger(rating) || rating < Review.MIN_RATING || rating > Review.MAX_RATING) {
      throw new Error(`Rating must be an integer between ${Review.MIN_RATING} and ${Review.MAX_RATING}`);
    }

    this.#reviewId = reviewId;
    this.#productId = productId;
    this.#buyerId = buyerId;
    this.#rating = rating;
    this.#comment = comment || null;
    this.#createdAt = createdAt || new Date();
    Object.freeze(this);
  }

  get reviewId() { return this.#reviewId; }
  get productId() { return this.#productId; }
  get buyerId() { return this.#buyerId; }
  get rating() { return this.#rating; }
  get comment() { return this.#comment; }
  get createdAt() { return this.#createdAt; }

  isPositive() { return this.#rating >= 4; }
  isNegative() { return this.#rating <= 2; }
  isNeutral() { return this.#rating === 3; }

  toDTO() {
    return {
      reviewId: this.#reviewId,
      productId: this.#productId,
      buyerId: this.#buyerId,
      rating: this.#rating,
      comment: this.#comment,
      createdAt: this.#createdAt instanceof Date ? this.#createdAt.toISOString() : this.#createdAt,
    };
  }

  toJSON() {
    return this.toDTO();
  }

  static fromDTO(dto) {
    return new Review({
      reviewId: dto.reviewId,
      productId: dto.productId,
      buyerId: dto.buyerId,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
    });
  }
}

module.exports = Review;
