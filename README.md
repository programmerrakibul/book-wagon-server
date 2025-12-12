# Book Wagon Server

Backend API server for the Book Wagon application - an online bookstore platform
with user authentication, book management, orders, payments, and wishlist
functionality.

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** for database
- **Firebase Admin** for authentication
- **Stripe** for payment processing
- **CORS** enabled for cross-origin requests

## Features

- User authentication and authorization (Admin, Librarian roles)
- Book catalog management
- Shopping cart and checkout
- Order management
- Payment processing with Stripe
- Wishlist functionality
- Comments and reviews system

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Firebase project with Admin SDK
- Stripe account for payment processing

## Installation

1. Clone the repository:

```bash
git clone https://github.com/programmerrakibul/book-wagon-server.git
cd book-wagon-server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
PAYMENT_GATEWAY_SECRET_KEY=your_stripe_secret_key
SITE_DOMAIN=http://localhost:5173
FIREBASE_SERVICE_KEY=your_firebase_service_account_json
PORT=8000
```

## Environment Variables

| Variable                     | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| `MONGODB_URI`                | MongoDB connection string                                    |
| `PAYMENT_GATEWAY_SECRET_KEY` | Stripe secret key for payment processing                     |
| `SITE_DOMAIN`                | Frontend application URL (for CORS)                          |
| `FIREBASE_SERVICE_KEY`       | Firebase Admin SDK service account credentials (JSON string) |
| `PORT`                       | Server port (default: 8000)                                  |

## Running the Server

### Development mode (with auto-reload):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on `http://localhost:8000` (or the port specified in your
`.env` file).

## API Endpoints

### Base URL

```
http://localhost:8000
```

### Routes

#### Users

- `POST /api/users` - Create/register user
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Books

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book (Librarian)
- `PUT /api/books/:id` - Update book (Admin/Librarian)
- `DELETE /api/books/:id` - Delete book (Admin)

#### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

#### Checkout

- `POST /api/checkout-session` - Create Stripe checkout session

#### Payments

- `GET /api/payments` - Get payment history
- `POST /api/payments` - Process payment

#### Wishlist

- `GET /api/wishlist/:userId` - Get user's wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:id` - Remove item from wishlist

#### Comments

- `GET /api/comments/:bookId` - Get comments for a book
- `POST /api/comments` - Add comment

## Project Structure

```
book-wagon-server/
├── controllers/          # Request handlers
│   ├── booksController.js
│   ├── checkoutController.js
│   ├── commentsController.js
│   ├── ordersController.js
│   ├── paymentsController.js
│   ├── usersController.js
│   └── wishlistController.js
├── middlewares/          # Authentication & authorization
│   ├── verifyAdmin.js
│   ├── verifyLibrarian.js
│   └── verifyTokenID.js
├── routes/              # API route definitions
│   ├── booksRouter.js
│   ├── checkoutRouter.js
│   ├── commentsRouter.js
│   ├── ordersRouter.js
│   ├── paymentsRouter.js
│   ├── usersRouter.js
│   └── wishlistRouter.js
├── utilities/           # Helper functions
│   └── generateOrderID.js
├── db.js               # Database connection
├── index.js            # Server entry point
├── .env                # Environment variables
└── package.json        # Dependencies
```

## Authentication

The API uses Firebase Authentication with custom middleware for role-based
access control:

- **verifyTokenID**: Validates Firebase ID tokens
- **verifyAdmin**: Ensures user has admin privileges
- **verifyLibrarian**: Ensures user has librarian privileges

Include the Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

## Deployment

The project is configured for deployment on Vercel (see `vercel.json`).

To deploy:

```bash
vercel --prod
```

Make sure to set all environment variables in your Vercel project settings.

## Author

**Md. Rakibul Islam**

- GitHub: [@programmerrakibul](https://github.com/programmerrakibul)
- Email: rakibul00206@gmail.com
