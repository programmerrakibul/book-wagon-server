import { ObjectId } from "mongodb";
import { Book } from "../models/book.model.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { Favorite } from "../models/favorite.model.js";
import type { Request, Response, NextFunction } from "express";
import type {
  TOrderDocument,
  TOrderStatus,
  TPaymentStatus,
} from "../types/order.interface.js";
import type { TFavoriteDocument } from "../types/favorite.interface.js";
import type { TBookDocument, TBookStatus } from "../types/book.interface.js";
import { OrderStatus, PaymentStatus } from "../validators/order.validator.js";
import type { TSuccessResponse } from "../types/index.interface.js";
import type { TUserDocument } from "../types/user.interface.js";
import { UserRole } from "../validators/user.validator.js";

export const getUserDashboardData = async (
  req: Request,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { email: customerEmail } = req.user;

    const orders: TOrderDocument[] | null = await Order.find({
      customerEmail,
    }).sort({ createdAt: -1 });

    const wishlist: TFavoriteDocument | null = await Favorite.findOne({
      customerEmail,
    });

    const wishlistBookIds = wishlist?.bookIDs || [];

    const wishlistBooksData: TBookDocument[] =
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

    const orderIds = purchasedBooks.map((order) => order.bookId);

    const orderBooks: TBookDocument[] =
      orderIds.length > 0 ? await Book.find({ _id: { $in: orderIds } }) : [];

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
        const book: TBookDocument | null = await Book.findById(order.bookId);

        if (!book) return null;

        return {
          id: order.orderID,
          bookName: book.bookName,
          bookImage: book.bookImage,
          amount: `৳ ${book.price}`,
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
      title: book.bookName,
      author: book.author,
      price: `৳ ${book.price}`,
      image: book.bookImage,
      bookId: book._id.toString(),
    }));

    res.send({
      success: true,
      message: "Dashboard data retrieved successfully!",
      data: {
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
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getLibrarianDashboardData = async (
  req: Request,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { email: librarianEmail } = req.user;

    const allOrders: TOrderDocument[] = await Order.find({
      librarianEmail,
    }).sort({
      createdAt: -1,
    });

    const myBooks: TBookDocument[] = await Book.find({ librarianEmail });

    const totalOrders = allOrders.length;
    const myBooksCount = myBooks.length;

    const orderBookIds = allOrders.map((order) => order.bookId);
    const orderBooks: TBookDocument[] = await Book.find({
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

    const totalCompletedOrder = statusCounts.delivered || 0;
    const pendingOrders = statusCounts.pending || 0;

    const recentOrders = await Promise.all(
      allOrders.slice(0, 8).map(async (order) => {
        const book: TBookDocument | null = await Book.findById(order.bookId);

        const customer: TUserDocument | null = await User.findOne({
          email: order.customerEmail,
        });

        return {
          id: order.orderID,
          customerName: order.customerName || customer?.name,
          customerEmail: order.customerEmail,
          bookName: book?.bookName,
          bookImage: book?.bookImage,
          amount: `৳ ${book?.price}`,
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
      bookSales[order.bookId.toString()] =
        bookSales[order.bookId.toString()] || 0;
    });

    const sortedBookIds = Object.entries(bookSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => new ObjectId(id));

    const topBooks: TBookDocument[] = await Book.find({
      _id: { $in: sortedBookIds },
    });

    const myTopBooks = topBooks.map((book) => {
      const sales = bookSales[book._id.toString()] || 0;
      const revenue = (book.price || 0) * sales;

      return {
        title: book.bookName,
        sales,
        revenue: `৳ ${revenue}`,
        bookId: book._id,
        price: book.price || 0,
      };
    });

    const monthlyData: Record<
      string,
      Record<"orders" | "revenue", number>
    > = {};

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

    res.send({
      success: true,
      message: "Dashboard data fetched successfully!",
      data: {
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
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminDashboardData = async (
  _req: Request,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const [allBooks, allOrders, allUsers, allWishlists] = await Promise.all([
      Book.find({}).sort({ createdAt: -1 }) as Promise<TBookDocument[]>,
      Order.find({}).sort({ createdAt: -1 }) as Promise<TOrderDocument[]>,
      User.find({}).sort({ createdAt: -1 }) as Promise<TUserDocument[]>,
      Favorite.find({}).sort({ createdAt: -1 }) as Promise<TFavoriteDocument[]>,
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

    const activeUsers = new Set(
      allOrders
        .filter((order) => new Date(order.createdAt) > thirtyDaysAgo)
        .map((order) => order.customerEmail),
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
        const book: TBookDocument | null = await Book.findById(order.bookId);
        const customer: TUserDocument | null = await User.findOne({
          email: order.customerEmail,
        });

        const librarian: TUserDocument | null = await User.findOne({
          email: order.librarianEmail,
        });

        return {
          id: order.orderID,
          bookId: order.bookId,
          customerName: order.customerName || customer?.name || "Customer",
          customerEmail: order.customerEmail,
          librarianName: librarian?.name || "Librarian",
          librarianEmail: order.librarianEmail,
          bookName: book?.bookName || "Unknown Book",
          bookImage: book?.bookImage,
          amount: `৳ ${book?.price || 0}`,
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
      bookSales[order.bookId.toString()] =
        bookSales[order.bookId.toString()] || 0;
    });

    const sortedBookIds = Object.entries(bookSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => new ObjectId(id));

    const topBooks: TBookDocument[] = await Book.find({
      _id: { $in: sortedBookIds },
    });

    const formattedTopBooks = topBooks.map((book) => {
      const sales = bookSales[book._id.toString()] || 0;

      return {
        title: book.bookName,
        sales,
        author: book.author,
        category: book.category,
        bookId: book._id,
        status: book.status,
        librarian: book.librarianEmail,
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

    const totalCompletedOrder = orderStatusCounts.delivered || 0;
    const successRate =
      totalOrders > 0
        ? Math.round((totalCompletedOrder / totalOrders) * 100)
        : 0;

    const booksPerLibrarian =
      totalLibrarians > 0 ? Math.round(totalBooks / totalLibrarians) : 0;

    const totalWishlistItems = allWishlists.reduce(
      (sum, wishlist) => sum + (wishlist.bookIDs.length || 0),
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

    res.send({
      success: true,
      message: "Dashboard data fetched successfully!",
      data: {
        stats: {
          totalBooks,
          totalUsers,
          totalOrders,
          activeUsers,
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
      },
    });
  } catch (err) {
    next(err);
  }
};
