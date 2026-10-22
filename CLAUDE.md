# Marketplace E-Commerce Platform

## Project Overview

This is a clean architecture implementation of an e-commerce marketplace following the principles from the Information Systems Architecture lecture. The project demonstrates protocol-agnostic business logic, separation of concerns, and dependency inversion.

## Project Context

This project was created as part of an educational exercise to understand Information Systems Architecture concepts. The original lecture code (located in `../JavaScript/`) demonstrated a simple shape manipulation API that worked with both HTTP and WebSocket protocols using the same business logic.

This marketplace project scales those concepts to a real-world e-commerce application with:
- Multiple domain entities (User, Product, Order, Cart, Review, Payment)
- PostgreSQL persistence
- RESTful HTTP API

## Architecture

### Layer Structure

```
src/
├── domain/                    # Business logic (NO framework dependencies)
│   ├── value-objects/         # Immutable, self-validating values
│   ├── entities/              # Domain objects with identity
│   ├── repositories/          # Repository interfaces (contracts)
│   └── use-cases/             # Business operations
├── infrastructure/            # External concerns
│   ├── persistence/postgres/  # Database implementations
│   └── transport/http/        # HTTP server and routes
└── application/               # Dependency injection & configuration
```

### Key Architectural Principles

1. **Protocol-Agnostic Domain Layer**
   - The `domain/` folder contains pure JavaScript with zero framework imports
   - No references to `pg`, `http`, `express`, or any external libraries
   - All dependencies are injected via constructors
   - This allows the same business logic to work with HTTP, WebSocket, CLI, or any transport

2. **Value Objects for Validation**
   - Immutable objects that enforce business rules at construction
   - Examples: `Money` (non-negative), `Email` (format validation), `StockQuantity` (integer >= 0)
   - All mutations return new instances, preserving immutability

3. **Entity Immutability**
   - All entity mutations return new instances
   - Example: `product.decreaseStock(5)` returns a new Product with updated stock
   - Prevents accidental state mutation and enables safe concurrency

4. **Repository Pattern**
   - Interfaces defined in `domain/repositories/`
   - Implementations in `infrastructure/persistence/`
   - Allows swapping databases without touching business logic

5. **Dependency Injection**
   - Use cases receive repositories via constructor
   - Container (`application/container.js`) wires everything together
   - Makes testing easy — mock repositories in unit tests

### Data Flow

```
HTTP Request → Route Handler → Use Case → Repository → Database
                     ↓
              Domain Entity (business logic)
                     ↓
              DTO (for serialization)
                     ↓
            HTTP Response (JSON)
```

## Database Schema

Located in `migrations/001_schema.sql`. Key tables:

| Table | Purpose |
|-------|---------|
| `users` | Buyers, sellers, admins with role-based access |
| `categories` | Hierarchical product categories |
| `products` | Items for sale with stock, price, SKU |
| `cart_items` | Transient shopping cart state |
| `orders` | Persistent order history with status lifecycle |
| `order_items` | Price snapshots at purchase time |
| `payments` | Payment transactions with status tracking |
| `reviews` | Product ratings and comments |

## API Endpoints

### Products
- `POST /api/products` - Create product (seller only)
- `GET /api/products` - List products (filters: categoryId, sellerId, search)
- `GET /api/products/:id` - Get product details
- `PATCH /api/products/:id` - Update product details
- `PATCH /api/products/:id/stock` - Update stock quantity

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item from cart

### Orders
- `POST /api/orders` - Create order from cart
- `GET /api/orders` - List user's orders (filter by status)
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status

### Reviews
- `POST /api/reviews` - Create review (buyer only, verified purchase)
- `GET /api/reviews/product/:productId` - Get product reviews with stats

## Running the Project

```bash
# Install dependencies
npm install

# Create database
createdb marketplace

# Run migrations
psql -d marketplace -f migrations/001_schema.sql

# Set environment variables
export PG_HOST=localhost
export PG_PORT=5432
export PG_DATABASE=marketplace
export PG_USER=postgres
export PG_PASSWORD=your_password

# Start server
npm start
```

Server runs on port 8000 by default.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PG_HOST` | localhost | PostgreSQL host |
| `PG_PORT` | 5432 | PostgreSQL port |
| `PG_DATABASE` | marketplace | Database name |
| `PG_USER` | postgres | Database user |
| `PG_PASSWORD` | (empty) | Database password |
| `PORT` | 8000 | HTTP server port |
| `NODE_ENV` | development | Environment |

## Testing Strategy

### Unit Tests (Domain Layer)
- Run without database or HTTP server
- Test value objects validation
- Test entity business logic
- Test use cases with mock repositories

### Integration Tests
- Test repository implementations against real database
- Test HTTP routes end-to-end

### Example Unit Test Pattern

```javascript
// tests/domain/entities/Product.test.js
const Product = require('../../../src/domain/entities/Product');

describe('Product', () => {
  it('should decrease stock and return new instance', () => {
    const product = new Product({
      productId: 1,
      sellerId: 1,
      title: 'Test Product',
      price: 99.99,
      stock: 10,
      sku: 'TEST-001',
    });

    const updated = product.decreaseStock(3);

    expect(product.stock.value).toBe(10);  // Original unchanged
    expect(updated.stock.value).toBe(7);   // New instance has new value
    expect(updated).not.toBe(product);      // Different instances
  });
});
```

## Key Lessons from Implementation

1. **Business logic is testable in isolation**
   - Domain tests run without database or HTTP server
   - No mocking frameworks needed — pass test doubles to use cases

2. **Database can be swapped**
   - Replace PostgreSQL with MongoDB by implementing repository interfaces
   - Zero changes to use cases or entities

3. **Transport can be swapped**
   - Add WebSocket by creating `WebSocketTransport.js`
   - Same use cases work for both HTTP and WebSocket
   - Follows the pattern from the original lecture code

4. **Use cases are reusable**
   - Same `CreateOrder` use case works with:
     - HTTP API
     - CLI commands
     - Background jobs
     - WebSocket handlers

5. **Validation is centralized**
   - Value objects enforce rules at entity boundaries
   - Invalid states are unrepresentable
   - Errors thrown early, not propagated through layers

## Future Enhancements

The following features are planned but not yet implemented:

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control middleware
   - Session management

2. **WebSocket Transport**
   - Real-time cart updates
   - Order status notifications
   - Live inventory sync

3. **Transaction Management**
   - Unit of Work pattern
   - Distributed transaction support
   - Saga pattern for complex workflows

4. **Event-Driven Features**
   - Domain events (OrderPlaced, PaymentCompleted)
   - Event handlers for notifications
   - Event sourcing for audit trail

5. **Caching Layer**
   - Redis for session storage
   - Product catalog caching
   - Cart state caching

## Connection to Original Lecture

The original lecture code (`../JavaScript/1-HTTP/` and `../JavaScript/2-WS/`) demonstrated:

- **Protocol-agnostic API files**: Same `api/*.js` files worked with both HTTP and WebSocket
- **Registry pattern**: Server loaded methods dynamically from `api/` directory
- **DTO boundary**: `{ method, args }` objects for communication

This marketplace project applies those same principles at production scale:

| Lecture Concept | Marketplace Implementation |
|-----------------|---------------------------|
| `api/move.js` (pure function) | `use-cases/CreateOrder.js` (class with injected deps) |
| `Map` registry | `Container` with explicit wiring |
| `memory.js` (global state) | Repository pattern with PostgreSQL |
| `{ method, args }` DTO | Entity `toDTO()` / `fromDTO()` methods |
| Two servers (HTTP + WS) | Extensible transport layer |

## Code Style

- ES modules with `'use strict'`
- Private fields with `#` prefix
- Immutable objects with `Object.freeze(this)`
- Factory methods for value object creation
- Async/await for all asynchronous operations
- JSDoc comments for interfaces

## Dependencies

### Production
- `pg` - PostgreSQL client
- `ws` - WebSocket server (for future real-time features)

### Development
- `eslint` - Code linting
- `prettier` - Code formatting

## File Count

- **Value Objects**: 4 files (Money, Email, StockQuantity, ProductSku)
- **Entities**: 9 files (User, Product, Category, CartItem, Order, OrderItem, Payment, Review, index)
- **Repository Interfaces**: 7 files
- **Use Cases**: 14 files
- **Repository Implementations**: 7 files
- **HTTP Routes**: 4 files
- **Application**: 3 files
- **Total**: ~50 JavaScript files

## Architectural Verification

To verify the architecture is correctly implemented:

```bash
# Domain layer has no framework dependencies
grep -r "require('pg\|http\|express\|ws')" src/domain/
# Should return nothing

# All use cases receive dependencies via constructor
grep -r "constructor.*Repository" src/domain/use-cases/
# Should show all use cases

# All entities have DTO methods
grep -r "toDTO\|fromDTO" src/domain/entities/
# Should show methods in all entities
```

## References

- Original lecture code: `../JavaScript/`
- Database schema: `migrations/001_schema.sql`
- Architecture decision records: (to be added as project evolves)
