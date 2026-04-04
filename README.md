# 📚 Book Wagon Server

A production-ready RESTful API backend for the **Book Wagon** platform - a
full-featured online bookstore management system with role-based access control,
integrated payment processing, real-time analytics, and comprehensive book
inventory management.

## 🎯 Overview

Book Wagon Server is a scalable Node.js backend solution built with Express and
TypeScript, providing a complete ecosystem for managing an online bookstore. It
supports three distinct user roles (Admin, Librarian, User) with granular
permission controls, secure Firebase authentication, integrated Stripe payment
processing, and advanced features like favorite books, order tracking, and user
reviews.

## 🛠 Tech Stack

| Component          | Technology              | Version |
| ------------------ | ----------------------- | ------- |
| **Runtime**        | Node.js with Express.js | v5.x    |
| **Language**       | TypeScript              | v6.x    |
| **Database**       | MongoDB with Mongoose   | v9.x    |
| **Authentication** | Firebase Admin SDK      | v13.x   |
| **Payment**        | Stripe API              | v20.x   |
| **Validation**     | Zod                     | v4.x    |
| **Deployment**     | Vercel (Serverless)     | -       |

## ✨ Key Features

### User Management

- ✅ Three-tier role-based access control (Admin, Librarian, User)
- ✅ Firebase authentication with JWT token verification
- ✅ User profile management and role assignment
- ✅ Last login tracking

### Book Catalog

- ✅ Complete book inventory management
- ✅ Advanced search and filtering (by name, author, category)
- ✅ Category and subcategory organization
- ✅ Book status management (published/unpublished)
- ✅ Pagination and dynamic field selection
- ✅ Book details: format, page count, publication year

### Order & Payment Management

- ✅ Order lifecycle management (pending → shipped → delivered → cancelled)
- ✅ Stripe checkout integration for secure payments
- ✅ Payment status tracking (paid/unpaid/failed/refunded)
- ✅ Auto-generated order IDs (BWxxxxxxxxxxxx format)
- ✅ Invoice generation and payment history

### User Features

- ✅ favorites functionality
- ✅ Book reviews and comments system
- ✅ Order tracking and history
- ✅ Payment invoice retrieval

### Dashboard Analytics

- ✅ User dashboard: order statistics, spending analytics
- ✅ Librarian dashboard: sales metrics, inventory analytics
- ✅ Admin dashboard: platform-wide analytics, revenue reports

### Security

- ✅ Firebase Admin SDK for secure authentication
- ✅ Role-based middleware authorization
- ✅ Input validation and sanitization (Zod)
- ✅ CORS configuration
- ✅ MongoDB ObjectId validation
- ✅ Environment variable protection
- ✅ Secure payment processing

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB** (local installation or
  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud database)
- **Firebase Project** with Admin SDK credentials
  ([Setup Guide](https://firebase.google.com/docs/admin/setup))
- **Stripe Account** with API keys ([Create Account](https://stripe.com))
- **npm** v9.0.0+ or **yarn** v3.0.0+ (comes with Node.js)
- **Git** for cloning the repository

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/programmerrakibul/book-wagon-server.git
cd book-wagon-server

# 2. Install dependencies
npm install

# 3. Configure environment variables (see Configuration section)
cp .env.example .env  # Copy example env file
# Edit .env with your credentials

# 4. Start development server
npm run dev

# Server will run on http://localhost:8000
```

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/?appName=<appName>
PAYMENT_GATEWAY_SECRET_KEY=sk_test_your_stripe_secret_key
SITE_DOMAIN=http://localhost:5173
FIREBASE_SERVICE_KEY=base64_encoded_firebase_service_account_json
PORT=8000
```

## ⚙️ Configuration

### Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?appName=<appName>

# Firebase Authentication
FIREBASE_SERVICE_KEY=your_base64_encoded_firebase_service_account_json

# Stripe Payment Gateway
PAYMENT_GATEWAY_SECRET_KEY=sk_test_your_stripe_secret_key

# Frontend URL (for redirects and CORS)
SITE_DOMAIN=http://localhost:5173
```

### Environment Variables Reference

| Variable                     | Type   | Required                     | Description                                                 |
| ---------------------------- | ------ | ---------------------------- | ----------------------------------------------------------- |
| `PORT`                       | Number | ❌ No (default: 8000)        | Server port number                                          |
| `NODE_ENV`                   | String | ❌ No (default: development) | Environment mode (development/production)                   |
| `MONGODB_URI`                | String | ✅ Yes                       | MongoDB connection string with authentication credentials   |
| `FIREBASE_SERVICE_KEY`       | String | ✅ Yes                       | Base64-encoded Firebase Admin SDK service account JSON file |
| `PAYMENT_GATEWAY_SECRET_KEY` | String | ✅ Yes                       | Stripe secret key for server-side payment processing        |
| `SITE_DOMAIN`                | String | ✅ Yes                       | Frontend application URL (used for CORS and redirects)      |

### How to Get Configuration Credentials

#### Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Settings → Service Accounts
3. Click "Generate New Private Key"
4. Convert the JSON to base64: `cat serviceAccountKey.json | base64`
5. Set as `FIREBASE_SERVICE_KEY`

#### Stripe Secret Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers → API Keys
3. Copy your Secret Key starting with `sk_test_` or `sk_live_`
4. Set as `PAYMENT_GATEWAY_SECRET_KEY`

#### MongoDB Connection String

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Connect" → "Drivers"
3. Copy the connection string
4. Replace `<username>`, `<password>`, and `<database-name>`
5. Set as `MONGODB_URI`

## 🏃 Running the Application

### Development Server

Start the development server with hot-reload using tsx watch:

```bash
npm run dev
```

- ✅ Auto-reload on file changes
- ✅ Full TypeScript support
- ✅ Source maps for debugging
- Runs on `http://localhost:8000`

### Production Build

Build and run the application in production mode:

```bash
# Build TypeScript to JavaScript
npm run build

# Run the compiled application
npm start
```

### Type Checking

Run TypeScript compiler without emitting code:

```bash
npm run type-check
```

## 📍 Quick Reference

### Base URL

```
http://localhost:8000
```

- For development: `http://localhost:8000`
- For production: Your deployed Vercel URL or custom domain

### Authentication

All protected endpoints require Firebase ID token in the Authorization header:

```http
Authorization: Bearer <firebase-id-token>
```

**How to get Firebase ID token (Frontend):**

```javascript
const user = await firebase.auth().currentUser;
const idToken = await user.getIdToken(true);
// Send in Authorization header
```

### Response Format

#### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  }
}
```

#### Paginated Response

```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": [
    /* array of items */
  ],
  "pagination": {
    "totalDocs": 100,
    "totalPages": 10,
    "page": 1,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

| Code  | Meaning      | Description                                 |
| ----- | ------------ | ------------------------------------------- |
| `200` | Success      | Request successful with data returned       |
| `201` | Created      | Resource created successfully               |
| `400` | Bad Request  | Invalid request parameters or data          |
| `401` | Unauthorized | Missing or invalid Firebase token           |
| `403` | Forbidden    | Insufficient permissions for this operation |
| `404` | Not Found    | Resource not found                          |
| `500` | Server Error | Internal server error                       |

## 📚 API Endpoints

### 👥 Users

| Method | Endpoint             | Auth   | Role  | Description                            |
| ------ | -------------------- | ------ | ----- | -------------------------------------- |
| `POST` | `/users`             | ❌ No  | -     | Register new user or update last login |
| `GET`  | `/users`             | ✅ Yes | Admin | Get all users with pagination          |
| `GET`  | `/users/role`        | ✅ Yes | Any   | Get user role                          |
| `PUT`  | `/users/update-role` | ✅ Yes | Admin | Update user role assignment            |

#### User Response Example

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "photoURL": "https://example.com/photo.jpg",
    "role": "user",
    "lastLoggedIn": "2024-04-04T10:30:00Z",
    "createdAt": "2024-04-01T10:30:00Z",
    "updatedAt": "2024-04-01T10:30:00Z"
  }
}
```

### 📖 Books

| Method   | Endpoint            | Auth   | Role            | Description                                             |
| -------- | ------------------- | ------ | --------------- | ------------------------------------------------------- |
| `GET`    | `/books`            | ❌ No  | -               | Get published books (filterable, searchable, paginated) |
| `GET`    | `/books/categories` | ❌ No  | -               | Get all available book categories                       |
| `GET`    | `/books/:id`        | ❌ No  | -               | Get detailed information for a specific book            |
| `POST`   | `/books`            | ✅ Yes | Librarian       | Create new book                                         |
| `PATCH`  | `/books/:id`        | ✅ Yes | Librarian/Admin | Update book information                                 |
| `DELETE` | `/books/:id`        | ✅ Yes | Admin           | Delete book from catalog                                |

#### Query Parameters for GET `/books`

```
GET /api/books?search=fiction&category=Fiction&sortBy=price&sortOrder=asc&page=1&limit=10
```

| Parameter   | Type   | Description                                   | Example                              |
| ----------- | ------ | --------------------------------------------- | ------------------------------------ |
| `search`    | String | Search by book name, author, or category      | `search=the hobbit`                  |
| `category`  | String | Filter by category                            | `category=Fiction`                   |
| `email`     | String | Filter books by librarian email               | `email=librarian@example.com`        |
| `role`      | String | Show unpublished books (admin/librarian only) | `role=admin`                         |
| `sortBy`    | String | Sort field                                    | `sortBy=price` or `sortBy=createdAt` |
| `sortOrder` | String | Sort direction                                | `sortOrder=asc` or `sortOrder=desc`  |
| `page`      | Number | Page number (default: 1)                      | `page=2`                             |
| `limit`     | Number | Results per page (default: 10)                | `limit=20`                           |
| `fields`    | String | Include specific fields (comma-separated)     | `fields=bookName,author,price`       |
| `excludes`  | String | Exclude specific fields (comma-separated)     | `excludes=description`               |

#### Book Response Example

```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "bookName": "The Hobbit",
      "author": "J.R.R. Tolkien",
      "category": "Fiction",
      "subcategory": "Fantasy",
      "price": 12.99,
      "quantity": 50,
      "format": "Paperback",
      "pageCount": 310,
      "publicationYear": 1937,
      "bookImage": "https://bookcovers.example.com/hobbit.jpg",
      "description": "A fantasy adventure novel...",
      "status": "published",
      "librarianEmail": "librarian@example.com",
      "createdAt": "2024-04-01T10:30:00Z"
    }
  ],
  "pagination": {
    "totalDocs": 150,
    "totalPages": 15,
    "page": 1,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 📋 Orders

| Method | Endpoint                    | Auth   | Role | Description                      |
| ------ | --------------------------- | ------ | ---- | -------------------------------- |
| `POST` | `/orders`                   | ✅ Yes | Any  | Create new order                 |
| `GET`  | `/orders`                   | ✅ Yes | User | Get all orders                   |
| `GET`  | `/orders/check-ordered/:id` | ✅ Yes | Any  | Check if book is ordered by user |
| `PUT`  | `/orders/:id`               | ✅ Yes | Any  | Update order status              |

#### Order Status Flow

```
pending → shipped → delivered
   ↓
cancelled
```

#### Order Response Example

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "bookId": "507f1f77bcf86cd799439012",
    "orderID": "BW-1704268200000",
    "librarianEmail": "librarian@example.com",
    "customerName": "Alice Johnson",
    "customerEmail": "alice@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State 12345",
    "status": "pending",
    "paymentStatus": "paid",
    "createdAt": "2024-04-04T10:30:00Z",
    "updatedAt": "2024-04-04T10:30:00Z"
  }
}
```

### 💳 Checkout & Payments

| Method | Endpoint                 | Auth   | Role | Description                           |
| ------ | ------------------------ | ------ | ---- | ------------------------------------- |
| `POST` | `/checkout/:orderID`     | ✅ Yes | Any  | Create Stripe checkout session        |
| `GET`  | `/checkout/retrieve/:id` | ✅ Yes | Any  | Retrieve session and finalize payment |
| `GET`  | `/payments`              | ✅ Yes | Any  | Get payment invoices                  |

#### Checkout Session Example

```json
{
  "success": true,
  "message": "Checkout session created",
  "data": "https://checkout.stripe.com/pay/cs_live_xxx..."
}
```

### ❤️ Favorites

| Method   | Endpoint                         | Auth   | Role | Description                   |
| -------- | -------------------------------- | ------ | ---- | ----------------------------- |
| `GET`    | `/favorites/books`               | ✅ Yes | Any  | Get user's favorite books     |
| `GET`    | `/favorites/is-in-favorites/:id` | ✅ Yes | Any  | Check if book is in favorites |
| `POST`   | `/favorites/:id`                 | ✅ Yes | Any  | Add book to favorites         |
| `DELETE` | `/favorites/:id`                 | ✅ Yes | Any  | Remove book from favorites    |

### 💬 Comments & Reviews

| Method | Endpoint        | Auth   | Role | Description                     |
| ------ | --------------- | ------ | ---- | ------------------------------- |
| `GET`  | `/comments/:id` | ❌ No  | -    | Get comments/reviews for a book |
| `POST` | `/comments/:id` | ✅ Yes | Any  | Add comment/review to a book    |

### 📊 Dashboard

| Method | Endpoint               | Auth   | Role      | Description                       |
| ------ | ---------------------- | ------ | --------- | --------------------------------- |
| `GET`  | `/dashboard/user`      | ✅ Yes | User      | Get user dashboard analytics      |
| `GET`  | `/dashboard/librarian` | ✅ Yes | Librarian | Get librarian dashboard analytics |
| `GET`  | `/dashboard/admin`     | ✅ Yes | Admin     | Get admin dashboard analytics     |

#### Dashboard Response Example

```json
{
  "success": true,
  "message": "Dashboard data retrieved",
  "data": {
    "totalOrders": 25,
    "completedOrders": 20,
    "pendingOrders": 5,
    "totalSpent": 450.5,
    "favoriteCount": 12,
    "commentCount": 8
  }
}
```

## 🗂️ Database Schemas

### User Schema

Represents a user in the system with role-based access.

```javascript
{
  _id: ObjectId,
  name: String,               // 3-50 characters, required
  email: String,              // Unique, validated email format
  photoURL: String,           // Valid URL format
  role: String,               // Enum: 'admin', 'librarian', 'user'
  lastLoggedIn: Date,         // Last login timestamp
  createdAt: Date,            // Account creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

**Validation Rules:**

- `name`: 3-50 characters
- `email`: Valid email format, unique in database
- `photoURL`: Valid URL format
- `role`: One of: `admin`, `librarian`, `user`

### Book Schema

Represents a book in the inventory.

```javascript
{
  _id: ObjectId,
  bookName: String,           // 3-200 characters, required
  author: String,             // 5-100 characters, required
  bookImage: String,          // Valid URL, required
  category: String,           // Enum: Fiction, Non-Fiction, Science, etc.
  subcategory: String,        // Optional subcategory
  publicationYear: Number,    // Year of publication
  pageCount: Number,          // Number of pages
  format: String,             // Enum: Hardcover, Paperback, eBook, Audiobook
  quantity: Number,           // Available quantity in stock
  price: Number,              // Price: 0-999999.99
  status: String,             // Enum: 'published', 'unpublished'
  description: String,        // 10-5000 characters, book description
  librarianEmail: String,     // Librarian who added the book
  createdAt: Date,            // Creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

**Validation Rules:**

- `bookName`: 3-200 characters
- `author`: 5-100 characters
- `price`: Between 0 and 999,999.99
- `description`: 10-5000 characters
- `pageCount`, `publicationYear`: Must be positive integers
- `quantity`: Non-negative integer

### Order Schema

Represents a book order.

```javascript
{
  _id: ObjectId,
  bookId: ObjectId,           // Reference to Book document
  librarianEmail: String,     // Email of book's librarian
  customerName: String,       // Name of the customer
  customerEmail: String,      // Email of the customer
  phone: String,              // Customer phone number
  address: String,            // Delivery address
  orderID: String,            // Unique order ID: BW-{timestamp}
  status: String,             // Enum: pending, shipped, delivered, cancelled
  paymentStatus: String,      // Enum: paid, unpaid, failed, refunded
  createdAt: Date,            // Order creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

**Order Status Lifecycle:**

- `pending` → `shipped` → `delivered` (normal flow)
- `pending` → `cancelled` (cancellation flow)

**Payment Status Values:**

- `paid` - Payment completed successfully
- `unpaid` - Payment not yet made
- `pending` - Payment processing
- `failed` - Payment failed
- `refunded` - Payment refunded

### Payment Schema

Tracks payment transactions for orders.

```javascript
{
  _id: ObjectId,
  orderID: String,            // Reference to Order ID
  transactionId: String,      // Stripe transaction ID
  bookId: ObjectId,           // Reference to Book document
  customer_email: String,     // Customer email address
  paymentStatus: String,      // Enum: paid, unpaid, pending, failed, refunded
  price: Number,              // Payment amount
  createdAt: Date,            // Payment timestamp
  updatedAt: Date             // Last update timestamp
}
```

### Comment Schema

Represents user comments/reviews on books.

```javascript
{
  _id: ObjectId,
  bookId: ObjectId,           // Reference to Book document
  rating: Number,             // Rating: 1-5 stars
  comment: String,            // Review text
  userEmail: String,          // Email of reviewer
  userName: String,           // Name of reviewer
  createdAt: Date,            // Comment timestamp
  updatedAt: Date             // Last update timestamp
}
```

### Favorite/Wishlist Schema

Represents user's favorite/wishlist items.

```javascript
{
  _id: ObjectId,
  userEmail: String,          // User's email
  bookId: ObjectId,           // Reference to Book document
  createdAt: Date,            // When added to wishlist
  updatedAt: Date             // Last update timestamp
}
```

## 📁 Project Structure

```
book-wagon-server/
├── src/
│   ├── config/                          # Configuration files
│   │   ├── db.config.ts                 # MongoDB connection setup
│   │   ├── env.config.ts                # Environment variables validation
│   │   └── stripe.config.ts             # Stripe configuration
│   │
│   ├── controllers/                     # Route handlers
│   │   ├── books.controller.ts          # Book CRUD operations
│   │   ├── checkout.controller.ts       # Stripe checkout logic
│   │   ├── comments.controller.ts       # Comment/review management
│   │   ├── dashboard.controller.ts      # Analytics for all roles
│   │   ├── favorites.controller.ts      # Wishlist operations
│   │   ├── orders.controller.ts         # Order management
│   │   ├── payments.controller.ts       # Payment tracking & invoices
│   │   └── users.controller.ts          # User management & authentication
│   │
│   ├── middlewares/                     # Express middleware functions
│   │   ├── authorize.middleware.ts      # Role-based authorization
│   │   ├── globalErrorHandler.middleware.ts  # Centralized error handling
│   │   ├── validateData.middleware.ts   # Request data validation (Zod)
│   │   ├── validateId.middleware.ts     # MongoDB ObjectId validation
│   │   └── verifyTokenID.middleware.ts  # Firebase token verification
│   │
│   ├── models/                          # Mongoose schemas & models
│   │   ├── book.model.ts                # Book schema with methods
│   │   ├── comment.model.ts             # Comment/Review schema
│   │   ├── favorite.model.ts            # Wishlist schema
│   │   ├── order.model.ts               # Order schema with pagination
│   │   ├── payment.model.ts             # Payment schema
│   │   └── user.model.ts                # User schema
│   │
│   ├── routes/                          # API route definitions
│   │   ├── book.router.ts
│   │   ├── checkout.router.ts
│   │   ├── comment.router.ts
│   │   ├── dashboard.router.ts
│   │   ├── favorite.router.ts
│   │   ├── order.router.ts
│   │   ├── payment.router.ts
│   │   └── user.router.ts
│   │
│   ├── types/                           # TypeScript interfaces & types
│   │   ├── book.interface.ts            # Book related types
│   │   ├── comment.interface.ts         # Comment related types
│   │   ├── express.d.ts                 # Express type augmentation
│   │   ├── favorite.interface.ts        # Favorite related types
│   │   ├── index.interface.ts           # Common response types
│   │   ├── order.interface.ts           # Order related types
│   │   ├── payment.interface.ts         # Payment related types
│   │   └── user.interface.ts            # User related types
│   │
│   ├── validators/                      # Zod validation schemas
│   │   ├── book.validator.ts            # Book data validation
│   │   ├── comment.validator.ts         # Comment data validation
│   │   ├── env.validator.ts             # Environment variables validation
│   │   ├── objectId.validator.ts        # MongoDB ObjectId validation
│   │   ├── order.validator.ts           # Order data validation
│   │   ├── payment.validator.ts         # Payment data validation
│   │   └── user.validator.ts            # User data validation
│   │
│   ├── utils/                           # Utility functions & helpers
│   │   └── utils.ts                     # Custom error classes, helpers
│   │
│   └── index.ts                         # Application entry point
│
├── Configuration Files
│   ├── .env                             # Environment variables (not in git)
│   ├── .gitignore                       # Git ignore rules
│   ├── package.json                     # Dependencies & scripts
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── vercel.json                      # Vercel deployment config
│   ├── README.md                        # This file
│   └── book_wagon_admin_sdk.json        # Firebase Admin SDK config
│
└── dist/ (generated)                    # Compiled JavaScript output
    ├── config/
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── types/
    ├── validators/
    ├── utils/
    └── index.js
```

### Key Directories

| Directory          | Purpose                                                   |
| ------------------ | --------------------------------------------------------- |
| `src/config/`      | Database, Stripe, and environment configuration           |
| `src/controllers/` | Business logic for handling API requests                  |
| `src/middlewares/` | Authentication, authorization, validation, error handling |
| `src/models/`      | MongoDB schemas and database models                       |
| `src/routes/`      | API endpoint definitions                                  |
| `src/types/`       | TypeScript interfaces for type safety                     |
| `src/validators/`  | Zod schemas for request validation                        |
| `src/utils/`       | Utility functions and custom error classes                |
| `dist/`            | Compiled TypeScript (generated after build)               |

## 🔒 Security Features

### Authentication & Authorization

- ✅ **Firebase Admin SDK** - Secure JWT token validation
- ✅ **Role-Based Access Control** - Three-tier permission system (Admin,
  Librarian, User)
- ✅ **Token Verification Middleware** - Every protected route validates
  Firebase ID tokens
- ✅ **Authorization Middleware** - Role-specific endpoint protection

### Data Protection

- ✅ **Input Validation** - Zod schema validation on all requests
- ✅ **MongoDB ObjectId Validation** - Prevents invalid database queries
- ✅ **Email Validation** - RFC-compliant email format checking
- ✅ **URL Validation** - Valid URL format for image links and redirects

### Network Security

- ✅ **CORS Configuration** - Controlled cross-origin requests
- ✅ **Environment Variable Protection** - Sensitive data protected via `.env`
- ✅ **Secure Stripe Integration** - Server-side payment processing only

### Error Handling

- ✅ **Centralized Error Handler** - Consistent error response format
- ✅ **Error Sanitization** - No sensitive data in error messages
- ✅ **Request Validation** - Rejects invalid/malicious requests early
- ✅ **Try-Catch Blocks** - Async error handling in all controllers

## ⚠️ Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

### HTTP Status Codes & Error Types

| Status | Error Type           | Example Scenario                              |
| ------ | -------------------- | --------------------------------------------- |
| `400`  | Bad Request          | Invalid query parameters, malformed JSON      |
| `401`  | Unauthorized         | Missing or invalid Firebase token             |
| `403`  | Forbidden            | User lacks required role permissions          |
| `404`  | Not Found            | Book, order, or user not found by ID          |
| `409`  | Conflict             | Duplicate email during user registration      |
| `422`  | Unprocessable Entity | Validation error (e.g., invalid price)        |
| `500`  | Server Error         | Database connection failure, unexpected error |

### Error Handling Middleware

The application includes a global error handler middleware that:

- Catches all unhandled errors in routes
- Logs errors for debugging
- Returns consistent error responses
- Prevents sensitive information leakage

### Common Error Messages

| Message                               | Cause                         | Solution                               |
| ------------------------------------- | ----------------------------- | -------------------------------------- |
| "Invalid ObjectId format"             | Malformed MongoDB ID          | Check ID format in URL                 |
| "Firebase token verification failed"  | Invalid/expired token         | Re-authenticate user                   |
| "User not authorized for this action" | Insufficient role permissions | Use account with required role         |
| "Book not found"                      | Invalid book ID               | Verify book exists in database         |
| "Validation failed"                   | Invalid request data          | Check request payload against API docs |

## 🚀 Deployment

### Vercel Deployment (Recommended)

This project is optimized for **serverless deployment on Vercel**.

#### Step 1: Prepare Repository

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New Project"
3. Import GitHub repository
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables in Vercel dashboard
6. Deploy

#### Step 3: Configure Environment Variables

In Vercel Dashboard, go to Settings → Environment Variables and add:

- `MONGODB_URI`
- `FIREBASE_SERVICE_KEY`
- `PAYMENT_GATEWAY_SECRET_KEY`
- `SITE_DOMAIN` (your production frontend URL)
- `PORT` (optional, default: 8000)

#### Step 4: Verify Deployment

```bash
# Test the deployed API
curl https://your-vercel-url.vercel.app/

# Should return:
# {"success":true,"message":"Welcome to the Book Wagon Server!"}
```

### vercel.json Configuration

The `vercel.json` file contains:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "FIREBASE_SERVICE_KEY": "@firebase_service_key",
    "PAYMENT_GATEWAY_SECRET_KEY": "@stripe_key",
    "SITE_DOMAIN": "@site_domain"
  }
}
```

## 📖 Development Guidelines

### Code Structure

- **Controllers**: Handle HTTP requests and responses only
- **Models**: Define Mongoose schemas and static methods
- **Validators**: Use Zod for type-safe validation
- **Middleware**: Chain for authentication → authorization → validation
- **Routes**: Map HTTP methods to controller methods

### Middleware Chain Pattern

```typescript
router.patch(
  "/:id",
  validateId, // 1. Validate MongoDB ObjectId
  verifyTokenID, // 2. Verify Firebase token
  authorize("admin", "librarian"), // 3. Check user role
  validateData(updateSchema), // 4. Validate request body
  updateBookById, // 5. Handle request
);
```

### Database Query Best Practices

- Use Mongoose methods for CRUD operations
- Implement pagination for large datasets
- Use aggregation pipelines for complex queries
- Always validate ObjectIDs before queries

### Async/Await Pattern

All async operations use async/await with try-catch:

```typescript
export const getBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const books = await Book.find();
    res.json({ success: true, data: books });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};
```

### Error Handling

- Always catch errors in async functions
- Use custom error classes for specific errors
- Pass errors to global error handler middleware
- Never send sensitive data in error responses

### Type Safety

- Use TypeScript interfaces for all data structures
- Define route parameter types explicitly
- Use Zod for runtime validation
- Augment Express types for custom properties

## 🤝 Contributing

### Development Workflow

1. **Fork & Clone**

```bash
git clone https://github.com/programmerrakibul/book-wagon-server.git
cd book-wagon-server
```

2. **Create Feature Branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make Changes & Commit**

```bash
git add .
git commit -m "feat: add amazing feature"
```

4. **Push & Create PR**

```bash
git push origin feature/amazing-feature
```

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Commit Message Format

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: format code
test: add tests
chore: update dependencies
```

### Health Check

Verify backend is running correctly:

```bash
# Test API connection
curl http://localhost:8000/

# Should return:
# {"success":true,"message":"Welcome to the Book Wagon Server!"}

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/users
```

## 📧 Support & Contact

For issues, questions, feature requests, or contributions:

### GitHub

- **Issues**:
  [Report a bug](https://github.com/programmerrakibul/book-wagon-server/issues)
- **Discussions**:
  [Ask questions](https://github.com/programmerrakibul/book-wagon-server/discussions)
- **Pull Requests**:
  [Contribute code](https://github.com/programmerrakibul/book-wagon-server/pulls)

### Contact

- **Email**: [rakibul00206@gmail.com](mailto:rakibul00206@gmail.com)
- **GitHub**: [@programmerrakibul](https://github.com/programmerrakibul)
- **LinkedIn**:
  [Connect on LinkedIn](https://www.linkedin.com/in/programmer-rakibul/)

## 👨‍💻 Author

**Md. Rakibul Islam**

Full-Stack MERN Developer passionate about building scalable web applications
and open-source projects.

- 🌐 **Website**: [Visit Portfolio](https://programmer-rakibul.netlify.app/)
- 💼 **LinkedIn**:
  [@programmerrakibul](https://www.linkedin.com/in/programmer-rakibul/)
- 🐙 **GitHub**: [@programmerrakibul](https://github.com/programmerrakibul)
- 📧 **Email**: [rakibul00206@gmail.com](mailto:rakibul00206@gmail.com)

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Firebase](https://firebase.google.com/) - Authentication platform
- [Stripe](https://stripe.com/) - Payment processing
- [Vercel](https://vercel.com/) - Deployment platform
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Zod](https://zod.dev/) - TypeScript-first schema validation

---

**Made with ❤️ by [Md. Rakibul Islam](https://github.com/programmerrakibul)**

## 🎯 Project Status

- ✅ Actively maintained
- ✅ Production ready
- ✅ Open for contributions
- 🔄 Continuous improvements

---

**Last Updated**: April 4, 2024
