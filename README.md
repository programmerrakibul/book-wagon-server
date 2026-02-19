# 📚 Book Wagon Server

A comprehensive RESTful API backend for the Book Wagon platform - an online
bookstore management system with role-based access control, payment processing,
and real-time dashboard analytics.

## Overview

Book Wagon Server provides a complete backend solution for managing an online
bookstore with three distinct user roles (Admin, Librarian, User), secure
authentication via Firebase, integrated Stripe payment processing, and
comprehensive order management capabilities.

## Tech Stack

- **Runtime**: Node.js with Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **Payment Gateway**: Stripe API
- **Deployment**: Vercel (serverless)
- **Security**: CORS, Firebase ID Token verification

## Key Features

- Role-based access control (Admin, Librarian, User)
- Firebase authentication with JWT token verification
- Complete book catalog management with categories and search
- Stripe checkout integration
- Order lifecycle management (pending → shipped → delivered)
- Wishlist/favorites functionality
- Book comments and reviews system
- Real-time dashboard analytics for all user roles
- Payment invoice generation and tracking
- Comprehensive data validation and error handling

## Prerequisites

Before running this project, ensure you have:

- Node.js (v14 or higher)
- MongoDB database (local or Atlas)
- Firebase project with Admin SDK credentials
- Stripe account with API keys
- npm or yarn package manager

## Installation

1. Clone the repository

```bash
git clone https://github.com/programmerrakibul/book-wagon-server.git
cd book-wagon-server
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/?appName=<appName>
PAYMENT_GATEWAY_SECRET_KEY=sk_test_your_stripe_secret_key
SITE_DOMAIN=http://localhost:5173
FIREBASE_SERVICE_KEY=base64_encoded_firebase_service_account_json
PORT=8000
```

## Environment Variables

| Variable                     | Description                                  | Required           |
| ---------------------------- | -------------------------------------------- | ------------------ |
| `MONGODB_URI`                | MongoDB connection string with credentials   | Yes                |
| `PAYMENT_GATEWAY_SECRET_KEY` | Stripe secret key for payment processing     | Yes                |
| `SITE_DOMAIN`                | Frontend application URL for redirects       | Yes                |
| `FIREBASE_SERVICE_KEY`       | Base64-encoded Firebase service account JSON | Yes                |
| `PORT`                       | Server port number                           | No (default: 8000) |

## Running the Application

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will be available at `http://localhost:8000`

## API Documentation

### Base URL

```text
http://localhost:8000/
```

### Authentication

All protected routes require a Firebase ID token in the Authorization header:

```http
Authorization: Bearer <firebase-id-token>
```

### Endpoints

#### Users

| Method | Endpoint             | Auth | Role  | Description                            |
| ------ | -------------------- | ---- | ----- | -------------------------------------- |
| POST   | `/users`             | No   | -     | Register new user or update last login |
| GET    | `/users`             | Yes  | Admin | Get all users                          |
| GET    | `/users/:email/role` | Yes  | Any   | Get user role by email                 |
| PUT    | `/users/:email/role` | Yes  | Admin | Update user role                       |

#### Books

| Method | Endpoint            | Auth | Role            | Description                                                      |
| ------ | ------------------- | ---- | --------------- | ---------------------------------------------------------------- |
| GET    | `/books`            | No   | -               | Get all published books (supports filtering, search, pagination) |
| GET    | `/books/categories` | No   | -               | Get all book categories                                          |
| GET    | `/books/:id`        | No   | -               | Get book details by ID                                           |
| POST   | `/books`            | Yes  | Librarian       | Add new book                                                     |
| PATCH  | `/books/:id`        | Yes  | Librarian/Admin | Update book details                                              |
| DELETE | `/books/:id`        | Yes  | Admin           | Delete book                                                      |

Query parameters for GET `/books`:

- `search` - Search by book name, author, or category
- `category` - Filter by category
- `email` - Filter by librarian email
- `role` - Show unpublished books for admin/librarian
- `sortBy` - Sort field (e.g., price, createdAt)
- `sortOrder` - asc or desc
- `limit` - Number of results (default: 10)
- `skip` - Pagination offset (default: 0)
- `fields` - Comma-separated fields to include
- `excludes` - Comma-separated fields to exclude

#### Orders

| Method | Endpoint                          | Auth | Role      | Description                      |
| ------ | --------------------------------- | ---- | --------- | -------------------------------- |
| POST   | `/orders`                         | Yes  | Any       | Create new order                 |
| GET    | `/orders/customer/:email`         | Yes  | User      | Get customer orders              |
| GET    | `/orders/librarian/:email`        | Yes  | Librarian | Get librarian's book orders      |
| GET    | `/orders/:id/user/:customerEmail` | Yes  | Any       | Check if book is ordered by user |
| PUT    | `/orders/:id`                     | Yes  | Any       | Update order status              |

#### Checkout & Payments

| Method | Endpoint                                 | Auth | Role | Description                                   |
| ------ | ---------------------------------------- | ---- | ---- | --------------------------------------------- |
| POST   | `/checkout-session/create`               | Yes  | Any  | Create Stripe checkout session                |
| GET    | `/checkout-session/retrieve/:session_id` | Yes  | Any  | Retrieve checkout session and process payment |
| GET    | `/payments/:email`                       | Yes  | Any  | Get payment invoices by email                 |

#### Wishlist

| Method | Endpoint                      | Auth | Role | Description                  |
| ------ | ----------------------------- | ---- | ---- | ---------------------------- |
| GET    | `/wishlist/:email/books`      | Yes  | Any  | Get user's wishlist books    |
| GET    | `/wishlist/:email/check/:id`  | Yes  | Any  | Check if book is in wishlist |
| POST   | `/wishlist/:email/add`        | Yes  | Any  | Add book to wishlist         |
| DELETE | `/wishlist/:email/remove/:id` | Yes  | Any  | Remove book from wishlist    |

#### Comments

| Method | Endpoint        | Auth | Role | Description             |
| ------ | --------------- | ---- | ---- | ----------------------- |
| GET    | `/comments/:id` | No   | -    | Get comments for a book |
| POST   | `/comments`     | Yes  | Any  | Add comment to a book   |

#### Dashboard

| Method | Endpoint                      | Auth | Role      | Description                       |
| ------ | ----------------------------- | ---- | --------- | --------------------------------- |
| GET    | `/dashboard/user/:email`      | Yes  | User      | Get user dashboard analytics      |
| GET    | `/dashboard/librarian/:email` | Yes  | Librarian | Get librarian dashboard analytics |
| GET    | `/dashboard/admin/:email`     | Yes  | Admin     | Get admin dashboard analytics     |

## Data Models

### User Schema

```javascript
{
  name: String,           // 3-50 characters
  email: String,          // Unique, validated
  photoURL: String,       // Valid URL
  role: String,           // 'admin', 'librarian', 'user'
  lastLoggedIn: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Book Schema

```javascript
{
  bookName: String,       // 3-200 characters
  author: String,         // 5-100 characters
  bookImage: String,      // Valid URL
  category: String,       // Enum: Fiction, Non-Fiction, Science, etc.
  subcategory: String,
  publicationYear: Number,
  pageCount: Number,
  format: String,         // Hardcover, Paperback, eBook, Audiobook
  quantity: Number,
  price: Number,          // 0-999999.99
  status: String,         // 'published', 'unpublished'
  description: String,    // 10-5000 characters
  librarianEmail: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema

```javascript
{
  bookId: ObjectId,
  librarianEmail: String,
  customerName: String,
  customerEmail: String,
  phone: String,
  address: String,
  orderID: String,        // Auto-generated: BW-xxxxxxxxxxxx
  status: String,         // pending, shipped, delivered, cancelled
  paymentStatus: String,  // paid, unpaid, failed, refunded
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Schema

```javascript
{
  orderID: String,
  transactionId: String,
  bookId: ObjectId,
  customer_email: String,
  paymentStatus: String,  // paid, unpaid, pending, failed, refunded
  price: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Project Structure

```text
book-wagon-server/
├── src/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── stripe.js                # Stripe configuration
│   ├── controllers/
│   │   ├── booksController.js       # Book CRUD operations
│   │   ├── checkoutController.js    # Stripe checkout logic
│   │   ├── commentsController.js    # Comment management
│   │   ├── dashboardController.js   # Analytics for all roles
│   │   ├── favoritesController.js   # Wishlist operations
│   │   ├── ordersController.js      # Order management
│   │   ├── paymentsController.js    # Payment tracking
│   │   └── usersController.js       # User management
│   ├── middlewares/
│   │   ├── validateId.js            # MongoDB ObjectId validation
│   │   ├── verifyAdmin.js           # Admin role verification
│   │   ├── verifyLibrarian.js       # Librarian role verification
│   │   └── verifyTokenID.js         # Firebase token verification
│   ├── models/
│   │   ├── Book.js                  # Book schema & methods
│   │   ├── Comment.js               # Comment schema & methods
│   │   ├── Favorite.js              # Wishlist schema & methods
│   │   ├── Order.js                 # Order schema & methods
│   │   ├── Payment.js               # Payment schema & methods
│   │   └── User.js                  # User schema & methods
│   ├── routes/
│   │   ├── booksRouter.js
│   │   ├── checkoutRouter.js
│   │   ├── commentsRouter.js
│   │   ├── dashboardRoutes.js
│   │   ├── favoritesRouter.js
│   │   ├── ordersRouter.js
│   │   ├── paymentsRouter.js
│   │   └── usersRouter.js
│   └── index.js                     # Application entry point
├── .env                             # Environment variables
├── .gitignore
├── package.json
├── vercel.json                      # Vercel deployment config
└── README.md
```

## Security Features

- Firebase Admin SDK for secure authentication
- Role-based access control middleware
- MongoDB ObjectId validation
- Input sanitization and validation
- CORS configuration
- Environment variable protection
- Secure payment processing with Stripe

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Deployment

This project is configured for Vercel deployment:

1. Install Vercel CLI

```bash
npm install -g vercel
```

2. Deploy to production

```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

The `vercel.json` configuration handles serverless deployment automatically.

## Development Guidelines

- All routes use async/await for asynchronous operations
- Mongoose schemas include comprehensive validation
- Controllers handle errors with try-catch blocks
- Middleware chain: authentication → authorization → validation → controller
- Database queries use Mongoose methods and aggregation pipelines
- Static methods on models for complex business logic

## License

This project is licensed under the ISC License.

## Author

Md. Rakibul Islam

- GitHub: [@programmerrakibul](https://github.com/programmerrakibul)
- Email: <rakibul00206@gmail.com>

## Support

For issues, questions, or contributions, please open an issue on the GitHub
repository.
