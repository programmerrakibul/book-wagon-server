# API Endpoints

Base URL: `http://localhost:8000`

All protected endpoints require:

```
Authorization: Bearer <firebase-id-token>
```

---

## Health Check

| Method | Endpoint            | Auth | Description         |
| ------ | ------------------- | ---- | ------------------- |
| `GET`  | `/api/health-check` | No   | Server health check |

---

## Users

| Method  | Endpoint              | Auth | Role  | Description                                                |
| ------- | --------------------- | ---- | ----- | ---------------------------------------------------------- |
| `POST`  | `/api/users`          | No   | —     | Register or upsert user (updates `lastLoggedIn` if exists) |
| `GET`   | `/api/users`          | Yes  | ADMIN | Get all users (paginated, searchable)                      |
| `GET`   | `/api/users/profile`  | Yes  | Any   | Get authenticated user's profile                           |
| `GET`   | `/api/users/role`     | Yes  | Any   | Get authenticated user's role                              |
| `PATCH` | `/api/users/role/:id` | Yes  | ADMIN | Update user's role                                         |

**POST `/api/users` body:**

```json
{ "name": "string", "email": "string", "photoUrl": "string (URL)" }
```

**PATCH `/api/users/role/:id` body:**

```json
{ "role": "USER" | "LIBRARIAN" | "ADMIN" }
```

**Query params (GET `/api/users`):** `page`, `limit`, `search`, `sortBy`,
`sortOrder`, `fields`, `excludes`

---

## Books

| Method   | Endpoint                       | Auth | Role             | Description                                    |
| -------- | ------------------------------ | ---- | ---------------- | ---------------------------------------------- |
| `GET`    | `/api/books`                   | No   | —                | List books (paginated, searchable, filterable) |
| `GET`    | `/api/books/:id`               | No   | —                | Get book by ID                                 |
| `POST`   | `/api/books`                   | Yes  | LIBRARIAN        | Create a new book                              |
| `PUT`    | `/api/books/:id`               | Yes  | LIBRARIAN        | Update a book                                  |
| `PATCH`  | `/api/books/:id/status`        | Yes  | LIBRARIAN        | Toggle published/unpublished                   |
| `PATCH`  | `/api/books/:id/active-status` | Yes  | ADMIN            | Toggle active/inactive                         |
| `DELETE` | `/api/books/:id`               | Yes  | LIBRARIAN, ADMIN | Delete a book                                  |

**POST `/api/books` body:**

```json
{
  "name": "string",
  "author": "string",
  "photoUrl": "string (URL)",
  "categoryId": "ObjectId",
  "subcategoryId": "ObjectId (optional)",
  "formatId": "ObjectId",
  "publicationYear": "number",
  "pageCount": "number",
  "stock": "number (default: 1)",
  "price": "number",
  "discount": "number (0-99, optional)",
  "description": "string",
  "weight": "number (optional)",
  "status": "PUBLISHED | UNPUBLISHED (default: UNPUBLISHED)"
}
```

**Query params (GET `/api/books`):** `page`, `limit`, `search`, `sortBy`,
`sortOrder`, `fields`, `excludes`, `category` (name or slug), `email` (librarian
email)

---

## Categories

| Method | Endpoint          | Auth | Role  | Description                               |
| ------ | ----------------- | ---- | ----- | ----------------------------------------- |
| `GET`  | `/api/categories` | No   | —     | List all categories (with sub-categories) |
| `POST` | `/api/categories` | Yes  | ADMIN | Create a category                         |

**POST `/api/categories` body:**

```json
{ "name": "string (3-100 chars)", "photoUrl": "string (URL, optional)" }
```

Slug is auto-generated from name.

---

## Sub-Categories

| Method | Endpoint              | Auth | Role  | Description                                             |
| ------ | --------------------- | ---- | ----- | ------------------------------------------------------- |
| `GET`  | `/api/sub-categories` | No   | —     | List sub-categories (optionally filter by `categoryId`) |
| `POST` | `/api/sub-categories` | Yes  | ADMIN | Create a sub-category under a parent category           |

**GET query params:** `categoryId` (optional)

**POST `/api/sub-categories` body:**

```json
{
  "name": "string (3-100 chars)",
  "categoryId": "ObjectId",
  "photoUrl": "string (URL, optional)"
}
```

---

## Book Formats

| Method | Endpoint            | Auth | Role  | Description           |
| ------ | ------------------- | ---- | ----- | --------------------- |
| `GET`  | `/api/book-formats` | No   | —     | List all book formats |
| `POST` | `/api/book-formats` | Yes  | ADMIN | Create a book format  |

**POST `/api/book-formats` body:**

```json
{ "name": "string (1-100 chars)", "photoUrl": "string (URL, optional)" }
```

---

## Orders

| Method   | Endpoint                 | Auth | Role             | Description                        |
| -------- | ------------------------ | ---- | ---------------- | ---------------------------------- |
| `GET`    | `/api/orders`            | Yes  | Any              | List orders for authenticated user |
| `POST`   | `/api/orders`            | Yes  | Any              | Create a new order                 |
| `GET`    | `/api/orders/:id`        | Yes  | Any              | Get order by ID                    |
| `PATCH`  | `/api/orders/:id/status` | Yes  | ADMIN            | Update order status                |
| `DELETE` | `/api/orders/:id`        | Yes  | ADMIN, LIBRARIAN | Delete an order                    |

**POST `/api/orders` body:**

```json
{
  "bookId": "ObjectId",
  "quantity": "number (1-9999)",
  "phoneNumber": "string",
  "address": "string (3-100 chars)"
}
```

**PATCH `/api/orders/:id/status` body:**

```json
{ "status": "PENDING | SHIPPED | DELIVERED | CANCELLED" }
```

**Status flow:** `PENDING` → `SHIPPED` → `DELIVERED` (or `CANCELLED` from
PENDING/SHIPPED)

**Query params (GET `/api/orders`):** `page`, `limit`, `search`, `sortBy`,
`sortOrder`

---

## Checkout

| Method | Endpoint                     | Auth | Role | Description                        |
| ------ | ---------------------------- | ---- | ---- | ---------------------------------- |
| `POST` | `/api/checkout/:orderID`     | Yes  | Any  | Create Stripe Checkout Session     |
| `GET`  | `/api/checkout/retrieve/:id` | Yes  | Any  | Retrieve session & process payment |

**Flow:**

1. `POST /api/checkout/:orderID` — Returns a Stripe Checkout Session URL
2. User completes payment on Stripe
3. Stripe redirects to success URL with `session_id` query param
4. `GET /api/checkout/retrieve/:id` (id = Stripe session ID) — Processes
   payment, creates Payment record, updates Order status

---

## Payments

| Method | Endpoint        | Auth | Role | Description                                  |
| ------ | --------------- | ---- | ---- | -------------------------------------------- |
| `GET`  | `/api/payments` | Yes  | Any  | List payment invoices for authenticated user |

**Query params:** `page`, `limit`, `sortBy`, `sortOrder`

---

## Favorites

| Method   | Endpoint                   | Auth | Role | Description                                       |
| -------- | -------------------------- | ---- | ---- | ------------------------------------------------- |
| `GET`    | `/api/favorites/books`     | Yes  | Any  | Get user's favorite books (paginated, searchable) |
| `GET`    | `/api/favorites/check/:id` | Yes  | Any  | Check if a book is in favorites                   |
| `POST`   | `/api/favorites/:id`       | Yes  | Any  | Add book to favorites                             |
| `DELETE` | `/api/favorites/:id`       | Yes  | Any  | Remove book from favorites                        |

**GET `/api/favorites/books` query params:** `page`, `limit`, `search`,
`sortBy`, `sortOrder`, `fields`, `excludes`, `category`, `email`

---

## Comments

| Method | Endpoint            | Auth | Role | Description                                        |
| ------ | ------------------- | ---- | ---- | -------------------------------------------------- |
| `GET`  | `/api/comments/:id` | No   | —    | Get paginated comments for a book (`:id` = bookId) |
| `POST` | `/api/comments`     | Yes  | Any  | Create a comment on a book                         |

**POST `/api/comments` body:**

```json
{ "comment": "string (3-1000 chars)", "bookId": "ObjectId" }
```

**Query params (GET `/api/comments/:id`):** `page`, `limit`

---

## Dashboard

| Method | Endpoint                   | Auth | Role      | Description                                     |
| ------ | -------------------------- | ---- | --------- | ----------------------------------------------- |
| `GET`  | `/api/dashboard/user`      | Yes  | USER      | User dashboard (orders, spending, wishlist)     |
| `GET`  | `/api/dashboard/librarian` | Yes  | LIBRARIAN | Librarian dashboard (sales, revenue, top books) |
| `GET`  | `/api/dashboard/admin`     | Yes  | ADMIN     | Admin dashboard (platform-wide analytics)       |

---

## Query Parameters Reference

The following query parameters are available on paginated endpoints:

| Parameter   | Type            | Description                                  |
| ----------- | --------------- | -------------------------------------------- |
| `page`      | number          | Page number (default: 1)                     |
| `limit`     | number          | Results per page (default: 10)               |
| `search`    | string          | Free-text search (name, author, email, etc.) |
| `sortBy`    | string          | Field to sort by (default: `createdAt`)      |
| `sortOrder` | `asc` \| `desc` | Sort direction (default: `desc`)             |
| `fields`    | string          | Comma-separated fields to include            |
| `excludes`  | string          | Comma-separated fields to exclude            |

---

## HTTP Status Codes

| Code  | Meaning               | When                              |
| ----- | --------------------- | --------------------------------- |
| `200` | OK                    | Successful request                |
| `201` | Created               | Resource created successfully     |
| `400` | Bad Request           | Invalid request data              |
| `401` | Unauthorized          | Missing or invalid Firebase token |
| `403` | Forbidden             | Insufficient role permissions     |
| `404` | Not Found             | Resource not found                |
| `422` | Unprocessable Entity  | Validation error                  |
| `500` | Internal Server Error | Unexpected server failure         |
