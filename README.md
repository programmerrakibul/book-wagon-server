# Book Wagon Server

RESTful API backend for **Book Wagon** — an online bookstore with role-based
access control, Stripe payments, and real-time analytics.

## Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Runtime    | Node.js 22 (ESM)        |
| Language   | TypeScript 7.x (strict) |
| Framework  | Express 5.x             |
| Database   | MongoDB + Mongoose 9.x  |
| Validation | Zod 4.x                 |
| Auth       | Firebase Admin SDK 13.x |
| Payments   | Stripe 20.x             |

## Getting Started

### Prerequisites

- Node.js 22+
- MongoDB Atlas (or local instance)
- Firebase project with Admin SDK
- Stripe account

### Installation

```bash
git clone https://github.com/programmerrakibul/book-wagon-server.git
cd book-wagon-server
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URI=<your_mongodb_uri_string>
DB_NAME=book_wagon
FIREBASE_SERVICE_KEY=<base64_encoded_service_account_json>
PAYMENT_GATEWAY_SECRET_KEY=<your_stripe_key>
CLIENT_URL=http://localhost:5173
```

| Variable                     | Required | Default                 | Description                                  |
| ---------------------------- | -------- | ----------------------- | -------------------------------------------- |
| `PORT`                       | No       | `8000`                  | Server port                                  |
| `MONGODB_URI`                | Yes      | —                       | MongoDB connection string                    |
| `DB_NAME`                    | No       | `book_wagon`            | Database name                                |
| `FIREBASE_SERVICE_KEY`       | Yes      | —                       | Base64-encoded Firebase service account JSON |
| `PAYMENT_GATEWAY_SECRET_KEY` | Yes      | —                       | Stripe secret key                            |
| `CLIENT_URL`                 | No       | `http://localhost:5173` | Frontend URL for CORS and redirects          |

### Running

```bash
# Development (with hot-reload)
npm run dev

# Production build
npm run build
npm start
```

Server runs at `http://localhost:8000`.

## Project Structure

```
src/
├── config/                  # DB, env, Stripe setup
├── lib/                     # Reusable Zod query builders
├── middlewares/              # Auth, RBAC, validation, error handler
├── modules/
│   ├── book/                # Book CRUD, search, pagination
│   ├── book-format/         # Book format management
│   ├── category/            # Category management
│   ├── sub-category/        # Sub-category management
│   ├── user/                # User management, upsert, role toggle
│   ├── order/               # Order lifecycle management
│   ├── checkout/            # Stripe Checkout Session integration
│   ├── payment/             # Payment invoices
│   ├── favorite/            # Per-user book wishlist
│   ├── comment/             # Book comments
│   ├── dashboard/           # Role-specific analytics
│   └── health/              # Health check endpoint
├── types/                   # TypeScript type definitions
├── utils/                   # Response helpers, validators, utilities
├── validations/             # Shared Zod schemas (env, objectId)
└── index.ts                 # Entry point
```

Each module follows a layered architecture:

```
module/
├── interface/    # TypeScript types
├── model/        # Mongoose schema & model
├── validation/   # Zod schemas
├── service/      # Business logic
├── controller/   # Request handlers
└── routes/       # Express Router
```

## Authentication

Protected endpoints require a Firebase ID token:

```http
Authorization: Bearer <firebase-id-token>
```

## Roles

| Role        | Capabilities                                                                 |
| ----------- | ---------------------------------------------------------------------------- |
| `USER`      | Browse books, place orders, manage favorites, comment, view dashboard        |
| `LIBRARIAN` | Create/edit/delete own books, view orders for own books, librarian dashboard |
| `ADMIN`     | Full access — manage users, orders, categories, platform analytics           |

## Response Format

**Success:**

```json
{
  "success": true,
  "message": "Books fetched successfully!",
  "data": [...],
  "pagination": { "totalDocs": 50, "totalPages": 5, "page": 1, "hasNextPage": true, "hasPrevPage": false }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Book not found!"
}
```

## API Endpoints

See [endpoints.md](./endpoints.md) for the full API reference.

## Scripts

| Command         | Description                               |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Start dev server with hot-reload          |
| `npm run build` | Compile TypeScript + resolve path aliases |
| `npm start`     | Run compiled output                       |
