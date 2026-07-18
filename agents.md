# Book Wagon Server — AI Agent Blueprint

## 1. Project Overview

**Book Wagon** is an e-commerce bookstore backend built with the MERN stack
(MongoDB, Express 5, React, Node.js 22). It uses TypeScript in strict mode with
ESM (`"type": "module"`), Mongoose for ODM, Zod for validation, Firebase Admin
for auth, and Stripe for payments.

---

## 2. Core Tech Stack

| Layer      | Technology           | Version                                   |
| ---------- | -------------------- | ----------------------------------------- |
| Runtime    | Node.js              | 22 (ESM)                                  |
| Language   | TypeScript           | 7.x (strict mode, `verbatimModuleSyntax`) |
| Framework  | Express              | 5.x                                       |
| Database   | MongoDB via Mongoose | 9.x                                       |
| Validation | Zod                  | 4.x                                       |
| Auth       | Firebase Admin SDK   | 13.x                                      |
| Payments   | Stripe               | 20.x                                      |
| Pagination | mongoose-paginate-v2 | 1.9.x                                     |
| Errors     | http-errors-enhanced | 4.x                                       |

---

## 3. Architectural Rules

### 3.1 Modular Domain-Driven Design (DDD)

Every business domain is a self-contained module under `src/modules/<domain>/`.
Each module follows this exact structure:

```
src/modules/<domain>/
├── interface/<domain>.ts      # TypeScript interfaces & types
├── model/<domain>.ts          # Mongoose schema & model
├── validation/<domain>.ts     # Zod schemas (create, update, query)
├── service/<domain>.ts        # Business logic (pure functions, exported as object)
├── controller/<domain>.ts     # Request handlers (thin, delegates to service)
└── routes/<domain>.ts         # Express Router definitions
```

### 3.2 Strict Layer Responsibilities

| Layer          | Responsibility                              | Rules                                                                                                                                                                     |
| -------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Interface**  | TypeScript type definitions                 | Define `TDocument` (extends Mongoose Document), `TModel` (if custom statics needed), Zod-inferred types                                                                   |
| **Model**      | Mongoose schema, indexes, statics, hooks    | Define schema with `@index`, `pre()` hooks, plugins. Export the model.                                                                                                    |
| **Validation** | Zod schemas for request body, query, params | Create/update/query schemas. Export inferred types. Use shared query builders from `lib/query.ts`.                                                                        |
| **Service**    | Business logic, DB operations               | Use `parseOrThrow()` for validation. Use `getPaginatedData()` for paginated results. Throw `http-errors-enhanced` errors. Use sessions/transactions for multi-doc writes. |
| **Controller** | HTTP request/response handling              | Thin layer — call service, format response with `sendSuccessResponse()`. Never contain business logic.                                                                    |
| **Routes**     | Express Router + middleware composition     | Apply auth (`verifyTokenID`), role (`authorize()`), validation (`validateData()`), and param validation (`validateId`) middleware.                                        |

### 3.3 Data Flow

```
Request → Route (middleware) → Controller → Service → Model → MongoDB
                                    ↓
                              parseOrThrow(schema, payload)
                                    ↓
                              Business Logic
                                    ↓
                              Model operations (populate, paginate)
                                    ↓
                              getPaginatedData() / throw errors
                                    ↓
                              sendSuccessResponse(res, statusCode, data)
```

---

## 4. Naming Conventions

| Item               | Convention                                    | Example                                                |
| ------------------ | --------------------------------------------- | ------------------------------------------------------ |
| Module directories | `kebab-case`                                  | `sub-category`, `book-format`                          |
| Interface files    | `camelCase.ts`                                | `interface/book.ts`                                    |
| Document types     | `T` prefix + `Document` suffix                | `TBook`, `TUserDocument`                               |
| Model types        | `T` prefix + `Model` suffix                   | `TUserModel`, `TPaymentModel`                          |
| Zod schemas        | `camelCase` with `Schema` suffix              | `createBookSchema`, `bookQuerySchema`                  |
| Inferred types     | `T` prefix                                    | `TCreateBook`, `TBookQuery`                            |
| Service exports    | Default export object: `services`             | `export default services`                              |
| Controller exports | Named exports OR default `controllers` object | `export default controllers`                           |
| Route exports      | Named `const` or default `router`             | `export const usersRouter` / `export default router`   |
| Mongoose models    | PascalCase string model name                  | `"Book"`, `"User"`, `"Order"`                          |
| Collections        | PascalCase or default (lowercase plural)      | Explicit: `"Book"`, `"Order"` / Implicit: `"payments"` |

---

## 5. Shared Utilities & Infrastructure

### 5.1 `src/utils/`

| File                  | Exports                                                          | Purpose                                                                     |
| --------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `utils.ts`            | `parseOrThrow(schema, payload)`                                  | Validates payload against Zod schema, returns typed data or throws ZodError |
| `utils.ts`            | `double(value)`                                                  | Rounds number to 2 decimal places                                           |
| `utils.ts`            | `validateObjectId(id)`                                           | Returns boolean for MongoDB ObjectId validity                               |
| `utils.ts`            | `transformToObjectId(id)`                                        | Converts string to `Types.ObjectId`                                         |
| `sendResponse.ts`     | `sendSuccessResponse()`, `sendErrorResponse()`, `sendResponse()` | Standardized API response formatting                                        |
| `getPaginatedData.ts` | `getPaginatedData(result)`                                       | Transforms `PaginateResult<T>` into `{ data, pagination }` shape            |

### 5.2 `src/lib/query.ts`

Reusable Zod query schema building blocks for consistent query parsing:

| Export            | Fields                                                               |
| ----------------- | -------------------------------------------------------------------- |
| `paginationQuery` | `page` (string→number), `limit` (string→number)                      |
| `searchQuery`     | `search` (trimmed string)                                            |
| `sortQuery`       | `sortBy` (string), `sortOrder` (lowercase string)                    |
| `projectionQuery` | `fields` (comma-separated→array), `excludes` (comma-separated→array) |

Usage in validation files:

```ts
import {
  paginationQuery,
  sortQuery,
  searchQuery,
  projectionQuery,
} from "@/lib/query.js";

export const myQuerySchema = z.object({
  ...paginationQuery,
  ...sortQuery,
  ...searchQuery,
  ...projectionQuery,
});
```

### 5.3 Middlewares

| File                         | Export                 | Purpose                                                  |
| ---------------------------- | ---------------------- | -------------------------------------------------------- |
| `verify-token.ts`            | `verifyTokenID`        | Firebase Admin token verification, attaches `req.user`   |
| `authorize.ts`               | `authorize(...roles)`  | Role-based access control                                |
| `validateData.middleware.ts` | `validateData(schema)` | Zod body validation middleware                           |
| `validateId.middleware.ts`   | `validateId`           | MongoDB ObjectId param validation                        |
| `global-error-handler.ts`    | `globalErrorHandler`   | Catches ZodError (422) and HttpError (respective status) |

### 5.4 Config

| File               | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `config/env.ts`    | Loads `.env`, validates with `envSchema`, exports `envConfig` |
| `config/db.ts`     | MongoDB connection via `mongoose.connect()`                   |
| `config/stripe.ts` | Stripe client instance                                        |

---

## 6. Validation Rules

### 6.1 Every Endpoint MUST Use Zod

- **Body**: Use `validateData(schema)` middleware OR
  `parseOrThrow(schema, payload)` in service.
- **Query params**: Use `parseOrThrow(querySchema, req.query)` in controller or
  service.
- **URL params**: Use `validateId` middleware for `:id` params.

### 6.2 Zod Patterns Used

```ts
// ObjectId transform pattern
z.string()
  .trim()
  .min(1, "ID is required!")
  .refine((val) => validateObjectId(val), "Invalid MongoDB ID!")
  .transform((val) => transformToObjectId(val));

// String with auto-generation
z.string()
  .optional()
  .transform((val) => val || generateSlug(name));

// Number coercion (for query strings)
z.coerce.number().min(1).max(9999);

// Enum from const object
z.enum(Object.values(Status) as [TStatus, ...TStatus[]]);
```

---

## 7. Mongoose Patterns

### 7.1 Schema Structure

```ts
const schema = new Schema<TDocument>(
  {
    /* fields */
  },
  {
    timestamps: true,
    collection: "CollectionName", // Explicit PascalCase
    versionKey: false,
  },
);
```

### 7.2 Indexing Strategy

Apply `@index` or schema-level `index: true` on:

- Foreign key fields (`categoryId`, `librarianId`, `customerId`, `bookId`)
- Fields used in `$regex` search (`name`, `email`)
- Fields used in `$match` filters (`status`, `paymentStatus`, `slug`)
- Unique fields (`email`, `slug`, `orderID`, `transactionId`)

### 7.3 Populates (NEVER Aggregation Pipelines)

```ts
const populateOptions: PopulateOptions[] = [
  { path: "categoryId", select: "name slug" },
  { path: "librarianId", select: "name email" },
];

// In paginate options
const options: PaginateOptions = { populate: populateOptions };

// In findById
const doc = await Model.findById(id).populate(populateOptions).lean();
```

### 7.4 Transactions (Multi-Document Writes)

```ts
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Multiple operations with .session(session)
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  await session.endSession();
}
```

### 7.5 Pagination Pattern

```ts
import paginate from "mongoose-paginate-v2";

schema.plugin(paginate);

// In service
const result: PaginateResult<TDoc> = await Model.paginate(query, options);
return getPaginatedData(result); // → { data: T[], pagination: {...} }
```

---

## 8. Module Dependency Graph

```
User ←→ Book (librarianId, books[])
User ←→ Order (customerId, librarianId, orders[])
Book ←→ Category (categoryId)
Book ←→ SubCategory (subcategoryId)
Book ←→ BookFormat (formatId)
Book ←→ Order (bookId)
Book ←→ Payment (bookId)
Book ←→ Favorite (bookIDs[])
Book ←→ Comment (bookId)
Book ←→ Review (bookId)
Order ←→ Payment (orderID)
Order ←→ Checkout (orderId)
User ←→ Cart (userId)
Cart ←→ Book (bookId)
```

---

## 9. Response Format

### Success (Single)

```json
{
  "success": true,
  "message": "Resource fetched successfully!",
  "data": { ... }
}
```

### Success (Paginated)

```json
{
  "success": true,
  "message": "Resources fetched successfully!",
  "data": [ ... ],
  "pagination": {
    "totalDocs": 50,
    "hasPrevPage": true,
    "hasNextPage": false,
    "totalPages": 5,
    "page": 5
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 10. Route Registration

All routes are registered in `src/index.ts` under the `/api` prefix:

```ts
app.use(`${API_PREFIX}/<domain-plural>`, router);
```

Route naming convention: plural nouns (e.g., `/api/books`, `/api/users`,
`/api/orders`).

---

## 11. Error Handling

- **ZodError** → HTTP 422 with joined issue messages
- **NotFoundError** (http-errors-enhanced) → HTTP 404
- **BadRequestError** (http-errors-enhanced) → HTTP 400
- **UnauthorizedError** (http-errors-enhanced) → HTTP 401
- **ForbiddenError** (http-errors-enhanced) → HTTP 403
- **Unhandled** → HTTP 500 with generic message

---

## 12. File Path Aliases

```json
{ "@/*": ["./src/*", "./src/modules/*"] }
```

This allows imports like:

```ts
import Book from "@/book/model/book.js"; // → src/modules/book/model/book.ts
import { envConfig } from "@/config/env.js"; // → src/config/env.ts
import { parseOrThrow } from "@/utils/utils.js"; // → src/utils/utils.ts
```

---

## 13. Complete Module Inventory

| Module       | Status      | Has Service | Has Model     | Has Validation | Notes                            |
| ------------ | ----------- | ----------- | ------------- | -------------- | -------------------------------- |
| book         | ✅ Complete | ✅          | ✅            | ✅             | Reference module                 |
| category     | ✅ Complete | ✅          | ✅            | ✅             |                                  |
| sub-category | ✅ Complete | ✅          | ✅            | ✅             |                                  |
| book-format  | ✅ Complete | ✅          | ✅            | ✅             |                                  |
| user         | ✅ Complete | ✅          | ✅            | ✅             | Service layer added              |
| order        | ✅ Complete | ✅          | ✅            | ✅             |                                  |
| checkout     | ✅ Complete | ✅          | ❌ (no model) | ❌             | Service layer added              |
| payment      | ✅ Complete | ✅          | ✅            | ✅             | Migrated to mongoose-paginate-v2 |
| favorite     | ✅ Complete | ✅          | ✅            | ✅             | Service layer added              |
| comment      | ✅ Complete | ✅          | ✅            | ✅             | Service layer added              |
| dashboard    | ✅ Complete | ✅          | ❌ (no model) | ❌             | Service layer added              |
| review       | ✅ Complete | ✅          | ✅            | ✅             | Star ratings for books           |
| cart         | ✅ Complete | ✅          | ✅            | ✅             | Shopping cart                    |
| health       | ✅ Complete | N/A         | N/A           | N/A            | Simple health check              |
