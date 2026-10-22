'use strict';

const Container = require('./container');
const config = require('./config');

(async () => {
  try {
    console.log('Initializing marketplace application...');

    const container = await new Container().initialize();
    console.log('Container initialized');

    const server = container.createHttpServer();
    server.start(config.port);

    console.log(`Marketplace API running on http://localhost:${config.port}`);
    console.log('Available endpoints:');
    console.log('  Products:');
    console.log('    POST   /api/products          - Create product');
    console.log('    GET    /api/products          - List products');
    console.log('    GET    /api/products/:id      - Get product');
    console.log('    PATCH  /api/products/:id      - Update product');
    console.log('    PATCH  /api/products/:id/stock - Update stock');
    console.log('  Cart:');
    console.log('    GET    /api/cart              - Get cart');
    console.log('    POST   /api/cart              - Add to cart');
    console.log('    PATCH  /api/cart              - Update cart item');
    console.log('    DELETE /api/cart/:productId   - Remove from cart');
    console.log('  Orders:');
    console.log('    POST   /api/orders            - Create order');
    console.log('    GET    /api/orders            - List orders');
    console.log('    GET    /api/orders/:id        - Get order');
    console.log('    PATCH  /api/orders/:id/status - Update status');
    console.log('  Reviews:');
    console.log('    POST   /api/reviews           - Create review');
    console.log('    GET    /api/reviews/product/:productId - Get reviews');

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
})();
