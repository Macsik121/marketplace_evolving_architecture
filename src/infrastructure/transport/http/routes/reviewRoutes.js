'use strict';

class ReviewRoutes {
  #createReview;
  #getProductReviews;

  constructor(useCases) {
    this.#createReview = useCases.createReview;
    this.#getProductReviews = useCases.getProductReviews;
  }

  register(server) {
    // POST /api/reviews - Create review
    server.route('POST', '/api/reviews', async (req) => {
      const { buyerId, productId, rating, comment } = req.body;
      return this.#createReview.execute({ buyerId, productId, rating, comment });
    });

    // GET /api/reviews/product/:productId - Get product reviews
    server.route('GET', '/api/reviews/product/:productId', async (req) => {
      const productId = parseInt(req.params.productId, 10);
      return this.#getProductReviews.execute({ productId });
    });
  }
}

module.exports = ReviewRoutes;
