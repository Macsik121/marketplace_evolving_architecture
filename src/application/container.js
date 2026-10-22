'use strict';

const { getConnection } = require('../infrastructure/persistence/postgres/connection');

// Domain use cases
const CreateProduct = require('../domain/use-cases/CreateProduct');
const GetProduct = require('../domain/use-cases/GetProduct');
const ListProducts = require('../domain/use-cases/ListProducts');
const UpdateProduct = require('../domain/use-cases/UpdateProduct');
const UpdateProductStock = require('../domain/use-cases/UpdateProductStock');
const AddToCart = require('../domain/use-cases/AddToCart');
const GetCart = require('../domain/use-cases/GetCart');
const UpdateCart = require('../domain/use-cases/UpdateCart');
const RemoveFromCart = require('../domain/use-cases/RemoveFromCart');
const CreateOrder = require('../domain/use-cases/CreateOrder');
const GetOrder = require('../domain/use-cases/GetOrder');
const ListOrders = require('../domain/use-cases/ListOrders');
const UpdateOrderStatus = require('../domain/use-cases/UpdateOrderStatus');
const CreateReview = require('../domain/use-cases/CreateReview');
const GetProductReviews = require('../domain/use-cases/GetProductReviews');

// Infrastructure repositories
const PostgresUserRepository = require('../infrastructure/persistence/postgres/PostgresUserRepository');
const PostgresProductRepository = require('../infrastructure/persistence/postgres/PostgresProductRepository');
const PostgresOrderRepository = require('../infrastructure/persistence/postgres/PostgresOrderRepository');
const PostgresCartRepository = require('../infrastructure/persistence/postgres/PostgresCartRepository');
const PostgresCategoryRepository = require('../infrastructure/persistence/postgres/PostgresCategoryRepository');
const PostgresPaymentRepository = require('../infrastructure/persistence/postgres/PostgresPaymentRepository');
const PostgresReviewRepository = require('../infrastructure/persistence/postgres/PostgresReviewRepository');

// Transport
const HttpServer = require('../infrastructure/transport/http/HttpServer');
const ProductRoutes = require('../infrastructure/transport/http/routes/ProductRoutes');
const CartRoutes = require('../infrastructure/transport/http/routes/CartRoutes');
const OrderRoutes = require('../infrastructure/transport/http/routes/OrderRoutes');
const ReviewRoutes = require('../infrastructure/transport/http/routes/ReviewRoutes');

class Container {
  #instances = new Map();

  async initialize() {
    const pool = getConnection();

    // Repositories
    const userRepository = new PostgresUserRepository(pool);
    const productRepository = new PostgresProductRepository(pool);
    const orderRepository = new PostgresOrderRepository(pool);
    const cartRepository = new PostgresCartRepository(pool);
    const categoryRepository = new PostgresCategoryRepository(pool);
    const paymentRepository = new PostgresPaymentRepository(pool);
    const reviewRepository = new PostgresReviewRepository(pool);

    // Use Cases
    const useCases = {
      createProduct: new CreateProduct({ productRepository, userRepository }),
      getProduct: new GetProduct({ productRepository }),
      listProducts: new ListProducts({ productRepository }),
      updateProduct: new UpdateProduct({ productRepository, userRepository }),
      updateProductStock: new UpdateProductStock({ productRepository, userRepository }),
      addToCart: new AddToCart({ cartRepository, productRepository, userRepository }),
      getCart: new GetCart({ cartRepository, productRepository, userRepository }),
      updateCart: new UpdateCart({ cartRepository, productRepository, userRepository }),
      removeFromCart: new RemoveFromCart({ cartRepository, userRepository }),
      createOrder: new CreateOrder({ orderRepository, cartRepository, productRepository, userRepository }),
      getOrder: new GetOrder({ orderRepository, userRepository }),
      listOrders: new ListOrders({ orderRepository, userRepository }),
      updateOrderStatus: new UpdateOrderStatus({ orderRepository, userRepository }),
      createReview: new CreateReview({ reviewRepository, productRepository, userRepository, orderRepository }),
      getProductReviews: new GetProductReviews({ reviewRepository, productRepository }),
    };

    this.#instances.set('useCases', useCases);
    this.#instances.set('repositories', {
      user: userRepository,
      product: productRepository,
      order: orderRepository,
      cart: cartRepository,
      category: categoryRepository,
      payment: paymentRepository,
      review: reviewRepository,
    });

    return this;
  }

  getUseCases() {
    return this.#instances.get('useCases');
  }

  getRepositories() {
    return this.#instances.get('repositories');
  }

  createHttpServer() {
    const server = new HttpServer();
    const useCases = this.getUseCases();

    // Register routes
    new ProductRoutes(useCases).register(server);
    new CartRoutes(useCases).register(server);
    new OrderRoutes(useCases).register(server);
    new ReviewRoutes(useCases).register(server);

    return server;
  }
}

module.exports = Container;
