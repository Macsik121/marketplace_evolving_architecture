'use strict';

class OrderRoutes {
  #createOrder;
  #getOrder;
  #listOrders;
  #updateOrderStatus;

  constructor(useCases) {
    this.#createOrder = useCases.createOrder;
    this.#getOrder = useCases.getOrder;
    this.#listOrders = useCases.listOrders;
    this.#updateOrderStatus = useCases.updateOrderStatus;
  }

  register(server) {
    // POST /api/orders - Create order from cart
    server.route('POST', '/api/orders', async (req) => {
      const { buyerId, shippingAddress } = req.body;
      return this.#createOrder.execute({ buyerId, shippingAddress });
    });

    // GET /api/orders/:id - Get order by ID
    server.route('GET', '/api/orders/:id', async (req) => {
      const orderId = parseInt(req.params.id, 10);
      const userId = parseInt(req.query.userId, 10);
      return this.#getOrder.execute({ orderId, userId });
    });

    // GET /api/orders - List orders for user
    server.route('GET', '/api/orders', async (req) => {
      const buyerId = parseInt(req.query.buyerId, 10);
      const { status } = req.query;
      return this.#listOrders.execute({ buyerId, status });
    });

    // PATCH /api/orders/:id/status - Update order status
    server.route('PATCH', '/api/orders/:id/status', async (req) => {
      const orderId = parseInt(req.params.id, 10);
      const { userId, newStatus } = req.body;
      return this.#updateOrderStatus.execute({ orderId, userId, newStatus });
    });
  }
}

module.exports = OrderRoutes;
