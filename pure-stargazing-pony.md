# План: Исправление критических проблем и подготовка к production

## Контекст обновленный (09.11.2026)

Проект marketplace_evolving_architecture реализует чистую архитектуру e-commerce платформы с 15 API эндпоинтами. Были выполнены ключевые исправления Фазы 1. Теперь фокус на Фазе 2: OpenAPI документация и тестирование системы.

### Статус выполнения (что сделано):

✅ **Фаза 1.2 - UpdateProduct.js исправлен:**
- Добавлен метод `update(product)` в `IProductRepository.js` (интерфейс)
- Реализован `update()` в `PostgresProductRepository.js` 
- Исправлен `UpdateProduct.js` - теперь использует `update()` вместо `save()`
- Добавлена валидация структуры `updates` объекта

✅ **Фаза 5.2 - Валидация в use cases:**
- `CreateProduct.js` - добавлена валидация title, price, sku, stock, description
- `CreateReview.js` - добавлена валидация rating (1-5), comment length
- `UpdateProduct.js` - добавлена проверка структуры updates
- `UpdateProductStock.js` - улучшена валидация входных ID

✅ **Фаза 1.1 - Транзакционность CreateOrder:**
- Добавлен `updateStockInTransaction()` в `PostgresProductRepository.js`
- Добавлен `clearByUserInTransaction()` в `PostgresCartRepository.js`
- Добавлены `getClient()` и `saveInTransaction()` в `PostgresOrderRepository.js`
- Переписан `CreateOrder.js` для работы в единой транзакции (BEGIN/COMMIT/ROLLBACK)

### Что нужно сделать далее:

**Приоритет пользователя:**
1. **OpenAPI документация** для 15 API эндпоинтов (формат: YAML)
2. **Тестирование исправлений** - транзакционность, валидация DTO, API контракты
3. **Swagger UI интеграция** - через Swagger UI Express
4. Docker конфигурация (если время позволит)
5. Проектирование авторизации (документация без реализации)

**Что НЕ включаем в реализацию (оставляем на будущее):**
- Новые use cases (CreateUser, CreateCategory, ProcessPayment и т.д.)
- Большие данные и аналитику
- Domain Events и сложную событийную систему
- Микросервисную архитектуру
- Кэширование и оптимизацию производительности
- WebSocket transport или реальное время
- Реализацию авторизации (только проектирование)

**Ограничения:** Сосредоточиться на документации и тестировании существующего кода.

## Исследование системы (результаты)

### Обзор API эндпоинтов (15 эндпоинтов):

**Products API (5):**
1. `POST /api/products` - Создание продукта (seller только)
2. `GET /api/products/:id` - Получение продукта по ID
3. `GET /api/products` - Список продуктов с фильтрами
4. `PATCH /api/products/:id` - Обновление деталей продукта
5. `PATCH /api/products/:id/stock` - Обновление stock количества

**Cart API (4):**
6. `GET /api/cart` - Получить корзину пользователя
7. `POST /api/cart` - Добавить товар в корзину
8. `PATCH /api/cart` - Обновить количество товара
9. `DELETE /api/cart/:productId` - Удалить товар из корзины

**Orders API (4):**
10. `POST /api/orders` - Создать заказ из корзины
11. `GET /api/orders/:id` - Получить заказ по ID
12. `GET /api/orders` - Список заказов пользователя
13. `PATCH /api/orders/:id/status` - Обновить статус заказа

**Reviews API (2):**
14. `POST /api/reviews` - Создать отзыв (только verified purchase)
15. `GET /api/reviews/product/:productId` - Получить отзывы продукта

### Структура сущностей и DTO:

**Основные сущности (8):**
1. **Product** - productId, sellerId, categoryId, title, description, price, stock, sku, createdAt
2. **Order** - orderId, buyerId, items[], status, totalAmount, shippingAddress, createdAt
3. **OrderItem** - orderItemId, orderId, productId, quantity, priceAtPurchase
4. **CartItem** - cartItemId, userId, productId, quantity, updatedAt
5. **Review** - reviewId, productId, buyerId, rating (1-5), comment, createdAt
6. **User** - userId, email, role (buyer/seller/admin), createdAt
7. **Payment** - paymentId, orderId, paymentMethod, transactionReference, amount, status
8. **Category** - categoryId, name, parentCategoryId

**Value Objects (4):**
1. **Money** - amount (number >= 0), currency (3-буквенный код)
2. **Email** - валидация формата
3. **StockQuantity** - целое число >= 0
4. **ProductSku** - regex `/^[A-Z0-9\-_]{3,50}$/`

**Общая структура ответов API:**
```javascript
{
  success: boolean,
  data?: object | array,  // при success: true
  error?: string          // при success: false
}
```

### Ключевые архитектурные особенности:
- Чистая архитектура: Domain → Application → Infrastructure
- Protocol-agnostic domain layer (нет зависимостей от pg, http, express)
- Repository pattern с интерфейсами и PostgreSQL реализациями
- DTO паттерн через `toDTO()` методы
- Value objects для бизнес-логики и валидации
- Immutable entities (мутации возвращают новые экземпляры)

## План реализации Фазы 2: OpenAPI документация и тестирование

### Фаза 2: OpenAPI документация и тестирование (приоритет пользователя)

#### 2.1 Создать OpenAPI спецификацию (YAML формат)
**Новые файлы:**
- `docs/openapi.yaml` - основная спецификация в корне проекта
- `scripts/sync-openapi.js` - скрипт проверки синхронизации
- `docs/README.md` - документация по API

**Что должно быть в OpenAPI:**
1. **Базовые секции:**
   - `openapi: 3.1.0` с info, servers, tags
   - Все 15 эндпоинтов в `paths:`
   - Все DTO схемы в `components/schemas:`
   
2. **Схемы для всех сущностей (8):**
   - ProductDTO, OrderDTO, OrderItemDTO, CartItemDTO
   - ReviewDTO, UserDTO, PaymentDTO, CategoryDTO
   
3. **Схемы для Value Objects (4):**
   - Money, Email, StockQuantity, ProductSku
   
4. **Примеры запросов/ответов** для каждого эндпоинта
5. **Описания ошибок** с кодами 400, 404, 500
6. **Параметры запросов**: query, path, body

#### 2.2 Интегрировать Swagger UI Express
**Новые зависимости:**
```bash
npm install swagger-ui-express js-yaml
```

**Новые файлы:**
- `src/infrastructure/transport/http/swagger-ui.js` - обработчик Swagger UI
- `src/application/index.js` - интеграция маршрутов `/docs`

**Маршруты:**
- `GET /docs` - Swagger UI интерфейс
- `GET /docs/openapi.yaml` - Raw спецификация
- `GET /docs/swagger-ui.css` - стили
- `GET /docs/swagger-ui-bundle.js` - JS

#### 2.3 Тестирование исправлений (приоритеты пользователя)

**А. Тестирование транзакционности CreateOrder:**
```javascript
// Тест 1: Успешная транзакция (commit)
// Setup: Корзина с 2 товарами, достаточный сток
// Execute: CreateOrder
// Verify: Заказ создан, сток уменьшен, корзина очищена

// Тест 2: Rollback при ошибке
// Setup: Корзина с товаром, недостаточный сток
// Execute: CreateOrder
// Verify: Заказ не создан, сток не изменен, корзина не очищена

// Тест 3: Конкурентные заказы
// Setup: Товар с stock=5
// Execute: 2 concurrent заказа по 3 шт
// Verify: Только один успешен, другой ошибка
```

**Б. Тестирование валидации DTO:**
```javascript
// Тест 4: Value Objects validation
test('Money should reject negative amounts', () => {...});

// Тест 5: Entity validation
test('Product should validate title', () => {...});

// Тест 6: Request validation in use cases
test('CreateProduct should validate all inputs', async () => {...});
```

**В. Тестирование API контрактов:**
```javascript
// Тест 7: Все эндпоинты возвращают правильную структуру
// Использовать Dredd или supertest
// Проверить: {success: boolean, data?, error?}
```

#### 2.4 Дополнительные задачи

**Планируется по времени:**
1. **Docker конфигурация** (если время позволит)
   - `Dockerfile` для Node.js 18+
   - `docker-compose.yml` с PostgreSQL
   - `.env.example` и `DEPLOYMENT.md`

2. **Проектирование авторизации** (документация без реализации)
   - Схема аутентификации (JWT/sessions)
   - RBAC роли (buyer, seller, admin)
   - Middleware структура

#### 2.5 Оптимизация запросов (опционально)
- Исправить N+1 в PostgresOrderRepository
- Оптимизировать GetProductReviews
- Добавить индексы в миграции

### Детальный план реализации Фазы 2

#### Этап 1: Подготовка окружения и зависимостей (1 час)
**Задачи:**
1. Установить зависимости для OpenAPI и тестирования:
   ```bash
   npm install swagger-ui-express js-yaml
   npm install -D @stoplight/spectral-cli supertest dredd
   ```
2. Создать структуру директорий:
   ```
   docs/
     ├── openapi.yaml          # OpenAPI спецификация
     └── README.md            # Документация API
   scripts/
     ├── sync-openapi.js      # Проверка синхронизации
     └── validate-openapi.js  # Валидация спецификации
   tests/
     ├── integration/         # Интеграционные тесты
     ├── api/                # API контракт тесты
     └── transactions/       # Тесты транзакционности
   ```

#### Этап 2: Создание OpenAPI спецификации (4-5 часов)
**Задачи:**
1. **Базовые секции** (30 мин):
   - Info: title, version, description
   - Servers: http://localhost:8000
   - Tags: Products, Cart, Orders, Reviews

2. **Схемы компонентов** (3 часа):
   - Value Objects: Money, Email, StockQuantity, ProductSku
   - Entity DTO: ProductDTO, OrderDTO, CartItemDTO, ReviewDTO и др.
   - Request/Response схемы для каждого эндпоинта
   - Примеры значений для всех полей

3. **Описание эндпоинтов** (2 часа):
   - Все 15 эндпоинтов с полным описанием
   - Параметры (query, path, body)
   - Ответы (success, error)
   - Коды статусов и примеры ошибок

**Критические схемы:**
```yaml
# ProductDTO пример
ProductDTO:
  type: object
  required:
    - productId
    - sellerId
    - title
    - price
    - stock
    - sku
    - createdAt
  properties:
    productId: {type: integer, example: 1}
    sellerId: {type: integer, example: 10}
    title: {type: string, example: "Gaming Laptop"}
    price: {type: number, minimum: 0, example: 1299.99}
    stock: {type: integer, minimum: 0, example: 50}
    sku: {type: string, pattern: "^[A-Z0-9\\-_]{3,50}$", example: "LAPTOP-001"}
    createdAt: {type: string, format: date-time}
```

#### Этап 3: Интеграция Swagger UI Express (1-2 часа)
**Задачи:**
1. **Создать swagger-ui.js:**
   ```javascript
   const swaggerUi = require('swagger-ui-express');
   const YAML = require('js-yaml');
   const fs = require('fs');
   
   const openapiYaml = fs.readFileSync('docs/openapi.yaml', 'utf8');
   const swaggerDocument = YAML.load(openapiYaml);
   
   module.exports = {
     serve: swaggerUi.serve,
     setup: swaggerUi.setup(swaggerDocument),
     rawSpec: (req, res) => res.send(openapiYaml)
   };
   ```

2. **Интегрировать в index.js:**
   ```javascript
   const swaggerUi = require('./infrastructure/transport/http/swagger-ui');
   
   // Добавить маршруты
   server.route('GET', '/docs', swaggerUi.serve, swaggerUi.setup);
   server.route('GET', '/docs/openapi.yaml', swaggerUi.rawSpec);
   ```

#### Этап 4: Тестирование исправлений (3-4 часа)
**Задачи приоритетные:**

**А. Тестирование транзакционности (1.5 часа):**
1. **Успешная транзакция:**
   - Создать корзину с 2 товарами (stock=10)
   - Выполнить CreateOrder
   - Проверить: заказ создан, stock=8, корзина пуста

2. **Rollback при ошибке:**
   - Корзина с товаром (stock=2, запрос 5)
   - Выполнить CreateOrder
   - Проверить: заказ не создан, stock=2, корзина не изменилась

3. **Конкурентные заказы:**
   - Product stock=5
   - 2 параллельных заказа по 3 шт
   - Проверить: один успешен, другой ошибка, stock=2

**Б. Тестирование валидации DTO (1 час):**
1. **Value Objects:**
   - Money: отрицательные значения, не числа
   - StockQuantity: дробные числа, отрицательные
   - ProductSku: невалидные форматы, короткие/длинные строки

2. **Entity валидация:**
   - Product: пустой title, отрицательная цена
   - Review: rating 0, 6, дробные значения
   - Order: невалидные статусы

**В. Тестирование API контрактов (1.5 часа):**
1. **Структура ответов:**
   - Все эндпоинты возвращают {success, data?, error?}
   - Коды статусов: 200, 201, 400, 404, 500
   - Сообщения ошибок информативные

2. **Contract testing с Dredd:**
   ```bash
   # Установить и настроить Dredd
   npm install -D dredd
   # Создать dredd.yml
   # Запустить тесты
   dredd docs/openapi.yaml http://localhost:8000
   ```

#### Этап 5: Верификация и документация (1-2 часа)
**Задачи:**
1. **Валидация OpenAPI:**
   ```bash
   # Установить и запустить spectral
   npm install -D @stoplight/spectral-cli
   npx spectral lint docs/openapi.yaml
   ```

2. **Скрипт синхронизации:**
   - `scripts/sync-openapi.js` проверяет соответствие кода и документации
   - Сравнивает количество эндпоинтов
   - Проверяет DTO схемы

3. **Документация:**
   - `docs/README.md` - как использовать API
   - `CONTRIBUTING.md` - как обновлять документацию
   - Скриншоты Swagger UI

#### Этап 6: Дополнительные задачи (по времени)
**Если время позволит:**

1. **Docker конфигурация** (1-2 часа):
   - `Dockerfile` с Node.js 18, PostgreSQL клиент
   - `docker-compose.yml` с API + PostgreSQL
   - `.env.example`, `DEPLOYMENT.md`

2. **Проектирование авторизации** (1 час документация):
   - Архитектура JWT аутентификации
   - RBAC роли (buyer, seller, admin)
   - Middleware структура
   - Матрица прав доступа

3. **Оптимизация запросов** (2-3 часа):
   - Исправить N+1 в PostgresOrderRepository
   - Оптимизировать GetProductReviews
   - Добавить индексы в миграции**

## Ограничения плана - что НЕ реализуем

### Не реализуем (оставляем на будущее):

1. **Новые варианты использования (use cases):**
   - CreateUser, GetUser, UpdateUser
   - CreateCategory, GetCategories
   - ProcessPayment, GetPayment
   - DeleteProduct, DeleteReview
   - Любые другие CRUD операции для сущностей

2. **Большие данные и аналитика:**
   - Система рекомендаций
   - Предиктивная аналитика
   - Обработка потоковых данных
   - Сложные агрегации и отчеты

3. **Сложные архитектурные расширения:**
   - Domain Events и Event Sourcing
   - CQRS (Command Query Responsibility Segregation)
   - Микросервисная архитектура
   - WebSocket transport или реальное время

4. **Полноценная система безопасности (только проектирование):**
   - Реализация аутентификации (регистрация, вход)
   - Middleware для проверки JWT токенов
   - Хэширование паролей и управление сессиями

5. **Дополнительная инфраструктура:**
   - Кэширование (Redis, Memcached)
   - Очереди сообщений (RabbitMQ, Kafka)
   - Мониторинг и алертинг
   - CI/CD pipeline

### Что реализуем (ограниченный набор):

1. **Только исправление критических багов** в существующем коде
2. **OpenAPI документацию** для существующих API эндпоинтов
3. **Docker конфигурацию** для базового развертывания
4. **Проектирование безопасности** (документация, без кода)
5. **Базовые улучшения** валидации и обработки ошибок

## Пример структуры OpenAPI спецификации (основные компоненты)

### Базовые секции openapi.yaml:
```yaml
openapi: 3.1.0
info:
  title: Marketplace E-Commerce API
  version: 1.0.0
  description: Clean Architecture e-commerce platform API with 15 endpoints
  contact:
    name: Architecture Course
    
servers:
  - url: http://localhost:8000
    description: Development server
    
tags:
  - name: Products
    description: Product management endpoints (seller operations)
  - name: Cart
    description: Shopping cart operations
  - name: Orders
    description: Order management and processing
  - name: Reviews
    description: Product reviews and ratings
```

### Пример схемы ProductDTO:
```yaml
ProductDTO:
  type: object
  required:
    - productId
    - sellerId
    - title
    - price
    - stock
    - sku
    - createdAt
  properties:
    productId:
      type: integer
      description: Unique product identifier
      example: 1
    sellerId:
      type: integer
      description: ID of the seller who owns this product
      example: 10
    categoryId:
      type: integer
      nullable: true
      description: Product category ID
      example: 5
    title:
      type: string
      minLength: 1
      maxLength: 255
      description: Product name/title
      example: "Gaming Laptop"
    description:
      type: string
      nullable: true
      maxLength: 5000
      description: Detailed product description
      example: "High-performance gaming laptop with RTX 4090"
    price:
      type: number
      format: decimal
      minimum: 0
      description: Product price in USD
      example: 1299.99
    stock:
      type: integer
      minimum: 0
      description: Available stock quantity
      example: 50
    sku:
      type: string
      pattern: '^[A-Z0-9\-_]{3,50}$'
      description: Stock Keeping Unit (unique product identifier)
      example: "LAPTOP-001"
    createdAt:
      type: string
      format: date-time
      description: Timestamp when product was created
      example: "2024-01-15T10:30:00.000Z"
```

### Пример API эндпоинта:
```yaml
/api/products:
  post:
    tags:
      - Products
    summary: Create a new product
    description: |
      Creates a new product. Only sellers can create products.
      Validates all inputs and checks SKU uniqueness.
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateProductRequest'
          examples:
            validRequest:
              summary: Valid product creation request
              value:
                sellerId: 10
                categoryId: 5
                title: "Gaming Laptop"
                description: "High-performance laptop"
                price: 1299.99
                stock: 50
                sku: "LAPTOP-001"
    responses:
      201:
        description: Product created successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                  example: true
                product:
                  $ref: '#/components/schemas/ProductDTO'
      400:
        description: Invalid input or validation error
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                  example: false
                error:
                  type: string
                  example: "SKU already exists"
```

### Пример схемы ответа API (универсальная):
```yaml
ApiResponse:
  type: object
  required:
    - success
  properties:
    success:
      type: boolean
      description: Indicates if the operation was successful
    data:
      description: Operation result data when success is true
      oneOf:
        - $ref: '#/components/schemas/ProductDTO'
        - $ref: '#/components/schemas/CartItemDTO'
        - $ref: '#/components/schemas/OrderDTO'
        - $ref: '#/components/schemas/ReviewDTO'
        - type: array
          items: {}
    error:
      type: string
      nullable: true
      description: Error message when success is false
      example: "Product not found"
```

## Пример Docker конфигурации (если время позволит)

### Dockerfile (Node.js 18+):
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY . .

# PostgreSQL client для миграций
RUN apk add --no-cache postgresql-client

EXPOSE 8000
USER node

# Health check для мониторинга
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

CMD ["node", "src/application/index.js"]
```

### docker-compose.yml (API + PostgreSQL):
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - PG_HOST=postgres
      - PG_PORT=5432
      - PG_DATABASE=marketplace
      - PG_USER=postgres
      - PG_PASSWORD=postgres
      - PORT=8000
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
  
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=marketplace
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### .env.example (шаблон переменных окружения):
```env
# PostgreSQL configuration
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=marketplace
PG_USER=postgres
PG_PASSWORD=your_password

# Server configuration
PORT=8000
NODE_ENV=development

# Swagger UI (опционально)
SWAGGER_UI_ENABLED=true
SWAGGER_UI_PATH=/docs
```

### DEPLOYMENT.md (инструкция по развертыванию):
```markdown
# Развертывание Marketplace API

## Локальная разработка

1. Клонировать репозиторий
2. Установить зависимости: `npm install`
3. Создать базу данных: `createdb marketplace`
4. Выполнить миграции: `psql -d marketplace -f migrations/001_schema.sql`
5. Запустить сервер: `npm start`

## Docker развертывание

### Локальный Docker:
```bash
# Создать .env файл из .env.example
cp .env.example .env

# Запустить с docker-compose
docker-compose up -d

# Остановить
docker-compose down
```

### Production развертывание:
```bash
# Собрать production образ
docker build -t marketplace-api:latest .

# Запустить с Docker Compose production
docker-compose -f docker-compose.prod.yml up -d
```

## Health checks
- API: `GET http://localhost:8000/health` (возвращает {"status": "healthy"})
- PostgreSQL: автоматическая проверка доступности
```

## Список файлов для реализации Фазы 2

### ✅ Фаза 1: Выполнено (исправления уже внесены)
**Измененные файлы:**
1. `src/domain/use-cases/CreateOrder.js` ✅ - транзакционность (строки 107-116)
2. `src/domain/use-cases/UpdateProduct.js` ✅ - использует update() вместо save() (строка 80)
3. `src/domain/repositories/IProductRepository.js` ✅ - добавлен метод `update(product)` (строка 96)
4. `src/infrastructure/persistence/postgres/PostgresProductRepository.js` ✅ - `update()` и `updateStockInTransaction()`
5. `src/infrastructure/persistence/postgres/PostgresOrderRepository.js` ✅ - `getClient()` и `saveInTransaction()`
6. `src/infrastructure/persistence/postgres/PostgresCartRepository.js` ✅ - `clearByUserInTransaction()`
7. `src/domain/use-cases/UpdateProductStock.js` ✅ - проверка прав продавца (строки 42-55)
8. `src/domain/use-cases/CreateProduct.js` ✅ - валидация title, price, sku
9. `src/domain/use-cases/CreateReview.js` ✅ - валидация rating (1-5)
10. `src/domain/use-cases/UpdateProduct.js` ✅ - проверка структуры updates

### Фаза 2: OpenAPI документация и тестирование

#### Новые файлы (создать):
**OpenAPI документация:**
1. `docs/openapi.yaml` - основная спецификация OpenAPI
2. `docs/README.md` - документация по использованию API
3. `scripts/sync-openapi.js` - проверка синхронизации кода и документации
4. `scripts/validate-openapi.js` - валидация спецификации

**Swagger UI интеграция:**
5. `src/infrastructure/transport/http/swagger-ui.js` - обработчик Swagger UI
6. `package.json` - обновить зависимости (swagger-ui-express, js-yaml)

**Тесты (приоритетные):**
7. `tests/transactions/create-order.test.js` - тестирование транзакционности
8. `tests/validation/value-objects.test.js` - тестирование value objects
9. `tests/api/contracts.test.js` - тестирование API контрактов
10. `tests/integration/order-flow.test.js` - end-to-end тесты

#### Существующие файлы (модифицировать):
**Swagger UI маршруты:**
11. `src/application/index.js` - добавить маршруты `/docs` и `/docs/openapi.yaml`
12. `src/infrastructure/transport/http/HttpServer.js` - поддержка статических маршрутов (опционально)

**Docker конфигурация (если время позволит):**
13. `Dockerfile` - образ приложения
14. `docker-compose.yml` - компоновка сервисов
15. `.env.example` - шаблон переменных окружения
16. `DEPLOYMENT.md` - инструкция по развертыванию

**Проектирование авторизации (только документирование):**
17. `docs/auth-design.md` - архитектура аутентификации и RBAC
18. `docs/security-measures.md` - меры безопасности

### Критические файлы для проверки текущих исправлений:

**Для тестирования транзакционности:**
- `src/domain/use-cases/CreateOrder.js` - строки 106-130 (новый транзакционный блок)
- `src/infrastructure/persistence/postgres/PostgresOrderRepository.js` - методы getClient(), saveInTransaction()
- `src/infrastructure/persistence/postgres/PostgresProductRepository.js` - updateStockInTransaction()
- `src/infrastructure/persistence/postgres/PostgresCartRepository.js` - clearByUserInTransaction()

**Для тестирования валидации:**
- `src/domain/use-cases/CreateProduct.js` - строки 36-44 (валидация входных данных)
- `src/domain/use-cases/CreateReview.js` - строки 43-50 (валидация rating)
- `src/domain/value-objects/` - все value objects

**Для OpenAPI документации:**
- `src/domain/entities/*.js` - DTO структуры (методы toDTO())
- `src/infrastructure/transport/http/routes/*.js` - API эндпоинты
- `src/domain/use-cases/*.js` - структура ответов

**Общее количество новых файлов: 10 файлов**

## Верификация и тестирование

### Проверка выполненных исправлений Фазы 1:

**1. Проверка транзакционности CreateOrder:**
✅ **Успешная транзакция:**
- Создать корзину с 2 товарами (stock=10 каждый)
- Выполнить CreateOrder
- Проверить: order создан, stock=8, корзина пуста

✅ **Rollback при ошибке (insufficient stock):**
- Корзина с товаром (stock=2, запрос 5)
- Выполнить CreateOrder
- Проверить: order не создан, stock=2, корзина не очищена

✅ **Конкурентные заказы:**
- Product stock=5
- 2 параллельных заказа по 3 шт
- Проверить: один успешен, другой ошибка, stock=2

**2. Проверка UpdateProduct vs save():**
✅ **Обновление продукта:**
- Существующий productId=1, sellerId=10
- Выполнить UpdateProduct с новыми title, description
- Проверить: productId остается 1, не создается дубликат
- Проверить метод update() в PostgresProductRepository (UPDATE запрос)

**3. Проверка валидации в use cases:**
✅ **CreateProduct валидация:**
- Пустой title - ошибка
- Отрицательная price - ошибка  
- Невалидный SKU - ошибка
- Пустой SKU - ошибка

✅ **CreateReview валидация:**
- Rating 0 или 6 - ошибка
- Rating 3.5 (дробное) - ошибка
- Comment > 2000 символов - ошибка

✅ **UpdateProductStock проверка прав:**
- Продавец 10 пытается обновить товар продавца 20 - ошибка

### Верификация Фазы 2 (OpenAPI и тестирование):

**4. Проверка OpenAPI документации:**
- [ ] Все 15 эндпоинтов задокументированы в docs/openapi.yaml
- [ ] Все DTO схемы соответствуют entity.toDTO()
- [ ] Примеры запросов/ответов реалистичны
- [ ] Параметры (query, path, body) соответствуют routes
- [ ] Описания ошибок соответствуют коду

**5. Проверка Swagger UI:**
- [ ] Swagger UI доступен по http://localhost:8000/docs
- [ ] Отображаются все 15 эндпоинтов
- [ ] "Try it out" работает для всех методов
- [ ] Схемы отображаются корректно
- [ ] Примеры отображаются

**6. Проверка API контрактов:**
- [ ] Все эндпоинты возвращают {success, data?, error?}
- [ ] Коды статусов: 200, 201, 400, 404, 500
- [ ] Сообщения ошибок информативные
- [ ] DTO структуры соответствуют спецификации

**7. Тестирование с инструментами:**
- [ ] `npx spectral lint docs/openapi.yaml` - без ошибок
- [ ] `npx dredd docs/openapi.yaml http://localhost:8000` - все тесты проходят
- [ ] Скрипт `scripts/sync-openapi.js` проверяет соответствие

### Критерии завершения Фазы 2:

1. **✅ OpenAPI документация** - полная и корректная спецификация
2. **✅ Swagger UI** - доступен и функционален
3. **✅ Тестирование транзакционности** - CreateOrder работает атомарно
4. **✅ Тестирование валидации** - все use cases правильно валидируют входные данные
5. **✅ Тестирование API контрактов** - все эндпоинты соответствуют спецификации
6. **✅ Верификация документации** - синхронизирована с кодом

**После Фазы 2 система будет иметь:**
- Полную документацию API (OpenAPI + Swagger UI)
- Проверенные исправления транзакционности и валидации
- Автоматические проверки соответствия кода и документации
- Основу для дальнейшего развития (Docker, авторизация, оптимизация)

## Критерии завершения Фазы 2

### Основные критерии (приоритеты пользователя):

**✅ Исправления Фазы 1 проверены:**
1. **CreateOrder работает атомарно** - при ошибке rollback, данные в согласованном состоянии
2. **UpdateProduct использует update()** - не создает дубликатов, сохраняет productId
3. **Валидация в use cases работает** - обязательные поля проверяются, правильные сообщения ошибок
4. **Проверка прав продавца** - покупатель не может обновлять сток чужого товара

**🔄 Фаза 2: OpenAPI документация и тестирование:**
5. **OpenAPI спецификация полная** - 15 эндпоинтов, все DTO схемы, примеры
6. **Swagger UI доступен и функционален** - `/docs` работает, "Try it out" работает
7. **Тестирование транзакционности пройдено** - 3 ключевых теста (успех, rollback, конкурентность)
8. **Тестирование валидации DTO пройдено** - value objects, entities, use cases
9. **API контракты проверены** - все эндпоинты соответствуют спецификации
10. **Верификация документации** - синхронизация с кодом проверена

### Дополнительные критерии (по времени):

**Если время позволит:**
11. **Docker конфигурация** - `Dockerfile`, `docker-compose.yml`, инструкции
12. **Проектирование авторизации** - документация RBAC и аутентификации
13. **Оптимизация запросов** - исправление N+1, добавление индексов

### Что НЕ требуется на этом этапе:
- Реализация аутентификации (только проектирование)
- Новые API эндпоинты или use cases
- Большие данные или аналитика
- Микросервисная архитектура
- Кэширование или сложная оптимизация
- WebSocket или реальное время

## Риски и смягчение

### Риск 1: Нарушение транзакционности при внедрении изменений
**Смягчение:** 
- Использовать существующий паттерн транзакций из PostgresOrderRepository.save()
- Сначала протестировать на локальной БД с дебаг-логами
- Добавить try-catch с rollback для всех возможных ошибок

### Риск 2: Несовместимость изменений с существующими use cases
**Смягчение:**
- Добавлять новые методы в интерфейсы репозиториев (update(), findByBuyerAndStatus() и т.д.)
- Сохранять обратную совместимость со старыми методами
- Тестировать каждый use case после изменений

### Риск 3: Проблемы производительности из-за сложных JOIN запросов
**Смягчение:**
- Сначала реализовать JOIN с LIMIT для тестирования
- Проверить explain запросов на разных объемах данных
- Добавить индексы на часто фильтруемые поля (buyer_id, status, product_id)

## Порядок реализации

**Рекомендуемый порядок:**
1. **Сначала:** Исправить UpdateProduct (самая простая проблема)
2. **Затем:** Исправить валидацию в use cases
3. **Затем:** Оптимизировать запросы (N+1, GetProductReviews)
4. **Затем:** Исправить транзакционность в CreateOrder (самая сложная)
5. **В конце:** Улучшить обработку ошибок в HttpServer

**Почему такой порядок:**
1. UpdateProduct - самый простой баг, легко протестировать
2. Валидация - помогает предотвратить ошибки при тестировании
3. Оптимизация запросов - улучшает производительность до тестирования сложных сценариев
4. CreateOrder - самый критичный и сложный, требует тщательного тестирования
5. HttpServer - обработка ошибок важна на финальном этапе

## Результат

После реализации этого плана система будет работать "как часы":
- Критические баги исправлены
- Данные консистентны (транзакции)
- Валидация защищает от невалидных данных
- Запросы оптимизированы
- Ошибки обрабатываются корректно

**Это базовая работоспособность.** После этого можно будет приступать к:
1. Добавлению аутентификации (если потребуется)
2. Разработке недостающих use cases
3. Интеграционному тестированию
4. Подготовке к развертыванию