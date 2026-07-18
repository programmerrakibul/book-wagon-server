import type { TBook } from "@/book/interface/book.js";
import Book from "@/book/model/book.js";
import type { TBookStatus } from "@/book/validation/book.js";
import type { TFavorite } from "@/favorite/interface/favorite.js";
import Favorite from "@/favorite/model/favorite.js";
import type { TOrder } from "@/order/interface/order.js";
import Order from "@/order/model/order.js";
import {
  OrderStatus,
  PaymentStatus,
  type TOrderStatus,
  type TPaymentStatus,
} from "@/order/validation/order.js";
import type { TUser } from "@/user/interface/user.js";
import User from "@/user/model/user.js";
import { UserRole } from "@/user/validation/user.js";
import { ObjectId } from "mongodb";

const getUserDashboardData = async (customerEmail: string) => {
  const customer = await User.findOne({ email: customerEmail }).select("_id");

  const orders: TOrder[] = await Order.find(
    customer?._id ? { customerId: customer._id } : {},
  ).sort({ createdAt: -1 });

  const wishlist: TFavorite | null = await Favorite.findOne({
    customerEmail,
  });

  const wishlistBookIds = wishlist?.books || [];

  const wishlistBooksData: TBook[] =
    wishlistBookIds.length > 0
      ? await Book.find({ _id: { $in: wishlistBookIds } }).limit(5)
      : [];

  const totalCompletedOrder = orders.filter(
    (order) => order.status === OrderStatus.DELIVERED,
  ).length;

  const purchasedBooks = orders.filter(
    (order) => order.paymentStatus === PaymentStatus.PAID,
  );

  const totalBooksPurchased = purchasedBooks.length;

  const orderBookIds = purchasedBooks.map((order) => order.bookId);

  const orderBooks: TBook[] =
    orderBookIds.length > 0
      ? await Book.find({ _id: { $in: orderBookIds } })
      : [];

  const bookPriceMap: Record<string, number> = {};

  orderBooks.forEach((book) => {
    bookPriceMap[book._id.toString()] = book.price;
  });

  const totalSpent = orders.reduce((sum, order) => {
    if (order.paymentStatus === PaymentStatus.PAID) {
      const price = bookPriceMap[order.bookId.toString()] || 0;
      sum += price;
    }
    return sum;
  }, 0);

  const recentOrders = await Promise.all(
    orders.slice(0, 5).map(async (order) => {
      const book: TBook | null = await Book.findById(order.bookId);

      if (!book) return null;

      return {
        id: order._id.toString(),
        bookName: book.name,
        bookImage: book.photoUrl,
        amount: `$ ${book.price}`,
        paymentStatus: order.paymentStatus,
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };
    }),
  );

  const monthlyData: Record<string, Record<"orders" | "amount", number>> = {};

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { orders: 0, amount: 0 };
    }

    monthlyData[monthYear].orders++;

    const bookPrice = bookPriceMap[order.bookId.toString()] || 0;
    monthlyData[monthYear].amount += bookPrice;
  });

  const chartData = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month: month.split("-")[1] as string,
      orders: data.orders,
      amount: data.amount,
    }))
    .sort((a, b) => parseInt(a.month) - parseInt(b.month))
    .slice(-6);

  const statusDistribution = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<TOrderStatus, number>,
  );

  const firstOrder = orders[orders.length - 1];

  const memberSince = firstOrder
    ? new Date(firstOrder.createdAt).getFullYear()
    : new Date().getFullYear();

  const formattedWishlist = wishlistBooksData.map((book) => ({
    title: book.name,
    author: book.author,
    price: `$ ${book.price}`,
    image: book.photoUrl,
    bookId: book._id.toString(),
  }));

  return {
    stats: {
      totalOrders: orders.length,
      wishlistItems: wishlistBookIds.length,
      booksPurchased: totalBooksPurchased,
      totalCompletedOrder,
      totalSpent,
      booksThisMonth: orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }).length,
      memberSince,
    },
    recentOrders,
    wishlist: formattedWishlist,
    chartData,
    statusDistribution,
  };
};

const getLibrarianDashboardData = async (librarianEmail: string) => {
  const librarian = await User.findOne({ email: librarianEmail }).select("_id");

  const allOrders: TOrder[] = await Order.find(
    librarian?._id ? { librarianId: librarian._id } : {},
  ).sort({ createdAt: -1 });

  const myBooks: TBook[] = await Book.find(
    librarian?._id ? { librarianId: librarian._id } : {},
  );

  const totalOrders = allOrders.length;
  const myBooksCount = myBooks.length;

  const orderBookIds = allOrders.map((order) => order.bookId);
  const orderBooks: TBook[] = await Book.find({
    _id: { $in: orderBookIds },
  });

  const bookPriceMap: Record<string, number> = {};

  orderBooks.forEach((book) => {
    bookPriceMap[book._id.toString()] = book.price || 0;
  });

  let totalRevenue = 0;
  let monthlyRevenue = 0;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  allOrders.forEach((order) => {
    const price = bookPriceMap[order.bookId.toString()] || 0;
    totalRevenue += price;

    const orderDate = new Date(order.createdAt);

    if (
      orderDate.getMonth() === currentMonth &&
      orderDate.getFullYear() === currentYear
    ) {
      monthlyRevenue += price;
    }
  });

  const statusCounts = allOrders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<TOrderStatus, number>,
  );

  const totalCompletedOrder = statusCounts.DELIVERED || 0;
  const pendingOrders = statusCounts.PENDING || 0;

  const recentOrders = await Promise.all(
    allOrders.slice(0, 8).map(async (order) => {
      const book: TBook | null = await Book.findById(order.bookId);

      const customer = order.customerId
        ? await User.findById(order.customerId).select("name email")
        : null;

      return {
        id: order._id.toString(),
        customerName: customer?.name || "Customer",
        customerEmail: customer?.email || "",
        bookName: book?.name,
        bookImage: book?.photoUrl,
        amount: `$ ${book?.price}`,
        status: order.status,
        paymentStatus: order.paymentStatus,
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };
    }),
  );

  const bookSales: Record<string, number> = {};

  allOrders.forEach((order) => {
    const bookId = order.bookId.toString();
    bookSales[bookId] = (bookSales[bookId] || 0) + 1;
  });

  const sortedBookIds = Object.entries(bookSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => new ObjectId(id));

  const topBooks: TBook[] = await Book.find({
    _id: { $in: sortedBookIds },
  });

  const myTopBooks = topBooks.map((book) => {
    const sales = bookSales[book._id.toString()] || 0;
    const revenue = (book.price || 0) * sales;

    return {
      title: book.name,
      sales,
      revenue: `$ ${revenue}`,
      bookId: book._id,
      price: book.price || 0,
    };
  });

  const monthlyData: Record<string, Record<"orders" | "revenue", number>> = {};

  allOrders.forEach((order) => {
    const date = new Date(order.createdAt);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { orders: 0, revenue: 0 };
    }

    const bookPrice = bookPriceMap[order.bookId.toString()] || 0;

    monthlyData[monthYear].revenue += bookPrice;
    monthlyData[monthYear].orders++;
  });

  const chartData = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month: month.split("-")[1] as string,
      monthName: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
      }),
      orders: data.orders,
      revenue: data.revenue,
    }))
    .sort((a, b) => parseInt(a.month) - parseInt(b.month))
    .slice(-6);

  const previousMonthData = chartData[chartData.length - 2] || {
    orders: 0,
    revenue: 0,
  };
  const currentMonthData = chartData[chartData.length - 1] || {
    orders: 0,
    revenue: 0,
  };

  const orderTrend =
    previousMonthData.orders > 0
      ? Math.round(
          ((currentMonthData.orders - previousMonthData.orders) /
            previousMonthData.orders) *
            100,
        )
      : 0;

  const revenueTrend =
    previousMonthData.revenue > 0
      ? Math.round(
          ((currentMonthData.revenue - previousMonthData.revenue) /
            previousMonthData.revenue) *
            100,
        )
      : 0;

  const paymentDistribution = allOrders.reduce(
    (acc, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
      return acc;
    },
    {} as Record<TPaymentStatus, number>,
  );

  return {
    stats: {
      myBooks: myBooksCount,
      totalOrders,
      totalRevenue,
      totalCompletedOrder,
      pendingOrders,
      monthlyRevenue,
      averageOrderValue:
        totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      orderTrend,
      revenueTrend,
    },
    recentOrders,
    myTopBooks,
    chartData,
    statusDistribution: statusCounts,
    paymentDistribution,
  };
};

const getAdminDashboardData = async () => {
  const [allBooks, allOrders, allUsers, allWishlists] = await Promise.all([
    Book.find({}).sort({ createdAt: -1 }) as Promise<TBook[]>,
    Order.find({}).sort({ createdAt: -1 }) as Promise<TOrder[]>,
    User.find({}).sort({ createdAt: -1 }) as Promise<TUser[]>,
    Favorite.find({}).sort({ createdAt: -1 }) as Promise<TFavorite[]>,
  ]);

  const totalBooks = allBooks.length;
  const totalUsers = allUsers.length;
  const totalOrders = allOrders.length;
  const totalLibrarians = allUsers.filter(
    (user) => user.role === UserRole.LIBRARIAN,
  ).length;

  const totalReaders = allUsers.filter(
    (user) => user.role === UserRole.USER,
  ).length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUserIds = new Set(
    allOrders
      .filter((order) => new Date(order.createdAt) > thirtyDaysAgo)
      .map((order) => order.customerId?.toString()),
  ).size;

  const orderStatusCounts = allOrders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<TOrderStatus, number>,
  );

  const paymentStatusCounts = allOrders.reduce(
    (acc, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
      return acc;
    },
    {} as Record<TPaymentStatus, number>,
  );

  const recentOrders = await Promise.all(
    allOrders.slice(0, 10).map(async (order) => {
      const book: TBook | null = await Book.findById(order.bookId);
      const customer = order.customerId
        ? await User.findById(order.customerId).select("name email")
        : null;
      const librarian = order.librarianId
        ? await User.findById(order.librarianId).select("name email")
        : null;

      return {
        id: order._id.toString(),
        bookId: order.bookId,
        customerName: customer?.name || "Customer",
        customerEmail: customer?.email || "",
        librarianName: librarian?.name || "Librarian",
        librarianEmail: librarian?.email || "",
        bookName: book?.name || "Unknown Book",
        bookImage: book?.photoUrl,
        amount: `$ ${book?.price || 0}`,
        status: order.status,
        paymentStatus: order.paymentStatus,
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };
    }),
  );

  const bookSales: Record<string, number> = {};

  allOrders.forEach((order) => {
    const bookId = order.bookId.toString();
    bookSales[bookId] = (bookSales[bookId] || 0) + 1;
  });

  const sortedBookIds = Object.entries(bookSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => new ObjectId(id));

  const topBooks: TBook[] = await Book.find({
    _id: { $in: sortedBookIds },
  });

  const formattedTopBooks = topBooks.map((book) => {
    const sales = bookSales[book._id.toString()] || 0;

    return {
      title: book.name,
      sales,
      author: book.author,
      category: book.categoryId,
      bookId: book._id,
      status: book.status,
      librarian: book.librarianId,
    };
  });

  const monthlyUserData: Record<
    string,
    Record<"total" | "readers" | "librarians", number>
  > = {};

  allUsers.forEach((user) => {
    const date = new Date(user.createdAt);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    if (!monthlyUserData[monthYear]) {
      monthlyUserData[monthYear] = {
        total: 0,
        readers: 0,
        librarians: 0,
      };
    }

    monthlyUserData[monthYear].total++;

    if (user.role === UserRole.USER) {
      monthlyUserData[monthYear].readers++;
    } else if (user.role === UserRole.LIBRARIAN) {
      monthlyUserData[monthYear].librarians++;
    }
  });

  const userGrowthChartData = Object.entries(monthlyUserData)
    .map(([month, data]) => ({
      month: month.split("-")[1] as string,
      monthName: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
      }),
      totalUsers: data.total,
      readers: data.readers,
      librarians: data.librarians,
    }))
    .sort((a, b) => parseInt(a.month) - parseInt(b.month))
    .slice(-6);

  const bookStatusDistribution = allBooks.reduce(
    (acc, book) => {
      acc[book.status] = (acc[book.status] || 0) + 1;
      return acc;
    },
    {} as Record<TBookStatus, number>,
  );

  const totalCompletedOrder = orderStatusCounts.DELIVERED || 0;
  const successRate =
    totalOrders > 0 ? Math.round((totalCompletedOrder / totalOrders) * 100) : 0;

  const booksPerLibrarian =
    totalLibrarians > 0 ? Math.round(totalBooks / totalLibrarians) : 0;

  const totalWishlistItems = allWishlists.reduce(
    (sum, wishlist) => sum + (wishlist.books.length || 0),
    0,
  );

  const avgWishlistPerUser =
    totalUsers > 0 ? Math.round(totalWishlistItems / totalUsers) : 0;

  const recentUsers = allUsers
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)
    .map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      joinDate: new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));

  return {
    stats: {
      totalBooks,
      totalUsers,
      totalOrders,
      activeUsers: activeUserIds,
      totalLibrarians,
      totalReaders,
      totalCompletedOrder,
      successRate,
      booksPerLibrarian,
      totalWishlistItems,
      avgWishlistPerUser,
    },
    recentOrders,
    topBooks: formattedTopBooks,
    recentUsers,
    userGrowthChartData,
    orderStatusDistribution: orderStatusCounts,
    paymentStatusDistribution: paymentStatusCounts,
    bookStatusDistribution,
  };
};

const services = {
  getUserDashboardData,
  getLibrarianDashboardData,
  getAdminDashboardData,
};

export default services;
