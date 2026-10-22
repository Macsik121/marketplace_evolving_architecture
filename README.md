Typical marketplace project.The point of creating it is to explore different architectural principals and approaches in Information System Architecture. I have to understand these concepts on a basic application, then move on to implementing them in the real-world application. The AI works with typical projects better, so it's a great way to learn.

# Marketplace E-Commerce Platform

A clean architecture implementation of an e-commerce marketplace following the principles from the Information Systems Architecture lecture.

## Project Structure

```
marketplace/
├── src/
│   ├── domain/                    # Business logic (no framework dependencies)
│   │   ├── value-objects/         # Immutable, self-validating values
│   │   │   ├── Money.js
│   │   │   ├── Email.js
│   │   │   ├── StockQuantity.js
│   │   │   └── ProductSku.js
│   │   ├── entities/              # Domain entities with identity
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── CartItem.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   ├── Payment.js
│   │   │   └── Review.js
│   │   ├── repositories/          # Repository interfaces
│   │   │   ├── IUserRepository.js
│   │   │   ├── IProductRepository.js
│   │   │   ├── IOrderRepository.js
│   │   │   ├── ICartRepository.js
│   │   │   ├── ICategoryRepository.js
│   │   │   ├── IPaymentRepository.js
│   │   │   └── IReviewRepository.js
│   │   └── use-cases/             # Business operations
│   │       ├── CreateProduct.js
│   │       ├── GetProduct.js
│   │       ├── ListProducts.js
│   │       ├── UpdateProduct.js
│   │       ├── UpdateProductStock.js
│   │       ├── AddToCart.js
│   │       ├── GetCart.js
│   │       ├── UpdateCart.js
│   │       ├── RemoveFromCart.js
│   │       ├── CreateOrder.js
│   │       ├── GetOrder.js
│   │       ├── ListOrders.js
│   │       ├── UpdateOrderStatus.js
│   │       ├── CreateReview.js
│   │       └── GetProductReviews.js
│   ├── infrastructure/            # External concerns
│   │   └── persistence/
│   │       └── postgres/          # PostgreSQL implementations
│   │           ├── connection.js
│   │           ├── PostgresUserRepository.js
│   │           ├── PostgresProductRepository.js
│   │           ├── PostgresOrderRepository.js
│   │           ├── PostgresCartRepository.js
│   │           ├── PostgresCategoryRepository.js
│   │           ├── PostgresPaymentRepository.js
│   │           └── PostgresReviewRepository.js
│   │   └── transport/
│   │       └── http/              # HTTP transport layer
│   │           ├── HttpServer.js
│   │           └── routes/
│   │               ├── ProductRoutes.js
│   │               ├── CartRoutes.js
│   │               ├── OrderRoutes.js
│   │               └── ReviewRoutes.js
│   └── application/               # Dependency injection & configuration
│       ├── container.js
│       ├── config.js
│       └── index.js
├── package.json
└── README.md
```

## Architectural Principles

### 1. Protocol-Agnostic Domain Layer

The `domain/` folder contains pure business logic with **zero framework dependencies**:
- No `pg`, `express`, `http`, or any external imports
- All dependencies are injected via constructors
- Entities return DTOs for boundary crossing

### 2. Separation of Concerns

| Layer | Responsibility | Dependencies |
|-------|---------------|--------------|
| **Domain** | Business rules, entities, use cases | None |
| **Infrastructure** | Database, HTTP, external services | Domain interfaces |
| **Application** | Wiring, configuration | Domain + Infrastructure |

### 3. Dependency Inversion

- Repository **interfaces** live in `domain/repositories/`
- Repository **implementations** live in `infrastructure/persistence/`
- Use cases depend on interfaces, not implementations

### 4. Value Objects for Validation

```javascript
// Value objects enforce invariants at construction
const price = new Money(99.99);        // Validates non-negative
const email = new Email('user@example.com');  // Validates format
const stock = new StockQuantity(100);  // Validates integer >= 0
```

### 5. Entity Immutability

All entity mutations return new instances:

```javascript
const updatedProduct = product.decreaseStock(5);
const updatedOrder = order.transitionTo('paid');
```

## Database Schema

```sql
-- Run migrations to create tables
psql -U postgres -d marketplace -f migrations/001_schema.sql
```

## Installation

```bash
cd marketplace
npm install
```

## Running

```bash
# Set environment variables
export PG_HOST=localhost
export PG_PORT=5432
export PG_DATABASE=marketplace
export PG_USER=postgres
export PG_PASSWORD=your_password

# Start server
npm start
```

## API Endpoints

### Products

```
POST   /api/products              - Create product
GET    /api/products              - List products (?categoryId=&sellerId=&search=)
GET    /api/products/:id          - Get product
PATCH  /api/products/:id          - Update product
PATCH  /api/products/:id/stock    - Update stock
```

### Cart

```
GET    /api/cart                  - Get cart (?userId=)
POST   /api/cart                  - Add to cart
PATCH  /api/cart                  - Update quantity
DELETE /api/cart/:productId       - Remove from cart
```

### Orders

```
POST   /api/orders                - Create order from cart
GET    /api/orders                - List orders (?buyerId=&status=)
GET    /api/orders/:id            - Get order
PATCH  /api/orders/:id/status     - Update status
```

### Reviews

```
POST   /api/reviews               - Create review
GET    /api/reviews/product/:id   - Get product reviews
```

## Key Lessons from Implementation

1. **Business logic is testable in isolation** - Domain tests run without database or HTTP server
2. **Database can be swapped** - Replace PostgreSQL with MongoDB by implementing repository interfaces
3. **Transport can be swapped** - Add WebSocket by creating `WebSocketTransport.js` that calls the same use cases
4. **Use cases are reusable** - Same `CreateOrder` works with HTTP API, CLI, or background job
5. **Validation is centralized** - Value objects enforce rules at entity boundaries

## Next Steps

- Add authentication/authorization
- Implement WebSocket transport for real-time cart updates
- Add unit tests for domain layer
- Add transaction management (Unit of Work pattern)
- Implement event-driven features (order placed → email notification)
