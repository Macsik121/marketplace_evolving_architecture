'use strict';

class CartRoutes {
  #addToCart;
  #getCart;
  #updateCart;
  #removeFromCart;

  constructor(useCases) {
    this.#addToCart = useCases.addToCart;
    this.#getCart = useCases.getCart;
    this.#updateCart = useCases.updateCart;
    this.#removeFromCart = useCases.removeFromCart;
  }

  register(server) {
    // GET /api/cart - Get user's cart
    server.route('GET', '/api/cart', async (req) => {
      const userId = parseInt(req.query.userId, 10);
      return this.#getCart.execute({ userId });
    });

    // POST /api/cart - Add item to cart
    server.route('POST', '/api/cart', async (req) => {
      const { userId, productId, quantity } = req.body;
      return this.#addToCart.execute({ userId, productId, quantity });
    });

    // PATCH /api/cart - Update cart item quantity
    server.route('PATCH', '/api/cart', async (req) => {
      const { userId, productId, quantity } = req.body;
      return this.#updateCart.execute({ userId, productId, quantity });
    });

    // DELETE /api/cart/:productId - Remove item from cart
    server.route('DELETE', '/api/cart/:productId', async (req) => {
      const userId = parseInt(req.query.userId, 10);
      const productId = parseInt(req.params.productId, 10);
      return this.#removeFromCart.execute({ userId, productId });
    });
  }
}

module.exports = CartRoutes;
