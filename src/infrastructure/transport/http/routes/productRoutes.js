'use strict';

class ProductRoutes {
  #createProduct;
  #getProduct;
  #listProducts;
  #updateProduct;
  #updateProductStock;

  constructor(useCases) {
    this.#createProduct = useCases.createProduct;
    this.#getProduct = useCases.getProduct;
    this.#listProducts = useCases.listProducts;
    this.#updateProduct = useCases.updateProduct;
    this.#updateProductStock = useCases.updateProductStock;
  }

  register(server) {
    // POST /api/products - Create product
    server.route('POST', '/api/products', async (req) => {
      const { sellerId, categoryId, title, description, price, stock, sku } = req.body;
      return this.#createProduct.execute({
        sellerId,
        categoryId,
        title,
        description,
        price,
        stock,
        sku,
      });
    });

    // GET /api/products/:id - Get product by ID
    server.route('GET', '/api/products/:id', async (req) => {
      const productId = parseInt(req.params.id, 10);
      return this.#getProduct.execute({ productId });
    });

    // GET /api/products - List products with filters
    server.route('GET', '/api/products', async (req) => {
      const { categoryId, sellerId, search, limit, offset } = req.query;
      return this.#listProducts.execute({
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        sellerId: sellerId ? parseInt(sellerId, 10) : undefined,
        search,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });
    });

    // PATCH /api/products/:id - Update product details
    server.route('PATCH', '/api/products/:id', async (req) => {
      const productId = parseInt(req.params.id, 10);
      const { sellerId, title, description, price } = req.body;
      return this.#updateProduct.execute({
        productId,
        sellerId,
        updates: { title, description, price },
      });
    });

    // PATCH /api/products/:id/stock - Update product stock
    server.route('PATCH', '/api/products/:id/stock', async (req) => {
      const productId = parseInt(req.params.id, 10);
      const { sellerId, quantity } = req.body;
      return this.#updateProductStock.execute({ productId, sellerId, quantity });
    });
  }
}

module.exports = ProductRoutes;
