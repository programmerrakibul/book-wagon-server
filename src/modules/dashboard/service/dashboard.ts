import Book from "@/book/model/book.js";
import type { TBookStatus } from "@/book/validation/book.js";
import Favorite from "@/favorite/model/favorite.js";
import Order from "@/order/model/order.js";
import {
  OrderStatus,
  PaymentStatus,
  type TOrderStatus,
  type TPaymentStatus,
} from "@/order/validation/order.js";
import User from "@/user/model/user.js";
import { UserRole } from "@/user/validation/user.js";
import { daysAgo, startOfMonth } from "@/utils/date.js";
import type { Types } from "mongoose";

const formatShortDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatMonthName = (monthKey: string): string => {
  const [year, month] = monthKey.split("-").map(Number);

  if (!year || !month) return "";

  return new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "short",
  });
};

const toRecord = (
  items: Array<{ count: number; [key: string]: unknown }>,
  keyField: string,
): Record<string, number> => {
  return Object.fromEntries(items.map((item) => [item[keyField], item.count]));
};

const getUserDashboardData = async (id: Types.ObjectId) => {
  const monthStart = startOfMonth();

  const [orderFacet, favoriteFacet] = await Promise.all([
    Order.aggregate([
      { $match: { customerId: id } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpent: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                      "$totalPrice",
                      0,
                    ],
                  },
                },
                booksPurchased: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                      1,
                      0,
                    ],
                  },
                },
                totalCompletedOrder: {
                  $sum: {
                    $cond: [{ $eq: ["$status", OrderStatus.DELIVERED] }, 1, 0],
                  },
                },
                booksThisMonth: {
                  $sum: {
                    $cond: [{ $gte: ["$createdAt", monthStart] }, 1, 0],
                  },
                },
                firstOrderDate: { $min: "$createdAt" },
              },
            },
          ],
          recentOrders: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "Book",
                localField: "bookId",
                foreignField: "_id",
                as: "book",
              },
            },
            {
              $unwind: { path: "$book", preserveNullAndEmptyArrays: true },
            },
            {
              $project: {
                _id: 1,
                name: "$book.name",
                photoUrl: "$book.photoUrl",
                paymentStatus: 1,
                createdAt: 1,
              },
            },
          ],
          statusDistribution: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } },
          ],
          chartData: [
            {
              $match: {
                createdAt: { $gte: daysAgo(180) },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" },
                },
                orders: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                      1,
                      0,
                    ],
                  },
                },
                amount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                      "$totalPrice",
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                month: { $substrBytes: ["$_id", 5, 2] },
                orders: 1,
                amount: { $round: ["$amount", 2] },
              },
            },
          ],
        },
      },
    ]),

    Favorite.aggregate([
      { $match: { userId: id } },
      {
        $facet: {
          items: [
            { $sort: { createdAt: -1 } },
            { $limit: 8 },
            {
              $lookup: {
                from: "Book",
                localField: "bookId",
                foreignField: "_id",
                as: "book",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      author: 1,
                      photoUrl: 1,
                      price: 1,
                      discount: 1,
                      discountedPrice: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$book",
                preserveNullAndEmptyArrays: true,
              },
            },
            { $replaceRoot: { newRoot: "$book" } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]),
  ]);

  const summary = orderFacet[0]?.summary[0] || {
    totalOrders: 0,
    totalSpent: 0,
    booksPurchased: 0,
    totalCompletedOrder: 0,
    booksThisMonth: 0,
    firstOrderDate: null,
  };

  const totalFavorites = favoriteFacet[0]?.totalCount[0]?.count || 0;

  return {
    stats: {
      totalOrders: summary.totalOrders,
      wishlistItems: totalFavorites,
      booksPurchased: summary.booksPurchased,
      totalCompletedOrder: summary.totalCompletedOrder,
      totalSpent: summary.totalSpent,
      booksThisMonth: summary.booksThisMonth,
      memberSince: summary.firstOrderDate
        ? new Date(summary.firstOrderDate).getFullYear()
        : new Date().getFullYear(),
    },
    recentOrders: (orderFacet[0]?.recentOrders || []).map(
      (order: Record<string, unknown>) => ({
        id: (order._id as Types.ObjectId).toString(),
        bookName: order.name || "Unknown Book",
        bookImage: order.photoUrl,
        paymentStatus: order.paymentStatus,
        date: formatShortDate(order.createdAt as Date),
      }),
    ),
    wishlist: favoriteFacet[0]?.items || [],
    chartData: orderFacet[0]?.chartData || [],
    statusDistribution: toRecord(
      orderFacet[0]?.statusDistribution || [],
      "status",
    ) as Record<TOrderStatus, number>,
  };
};

const getLibrarianDashboardData = async (librarianId: Types.ObjectId) => {
  const monthStart = startOfMonth();

  const [orderFacet, myBooksCount] = await Promise.all([
    Order.aggregate([
      { $match: librarianId ? { librarianId } : {} },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$price" },
                totalCompletedOrder: {
                  $sum: {
                    $cond: [{ $eq: ["$status", OrderStatus.DELIVERED] }, 1, 0],
                  },
                },
                pendingOrders: {
                  $sum: {
                    $cond: [{ $eq: ["$status", OrderStatus.PENDING] }, 1, 0],
                  },
                },
                monthlyRevenue: {
                  $sum: {
                    $cond: [{ $gte: ["$createdAt", monthStart] }, "$price", 0],
                  },
                },
              },
            },
          ],
          recentOrders: [
            { $sort: { createdAt: -1 } },
            { $limit: 8 },
            {
              $lookup: {
                from: "Book",
                localField: "bookId",
                foreignField: "_id",
                as: "book",
              },
            },
            {
              $lookup: {
                from: "User",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
              },
            },
            {
              $unwind: {
                path: "$book",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$customer",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                customerName: "$customer.name",
                customerEmail: "$customer.email",
                bookName: "$book.name",
                bookImage: "$book.photoUrl",
                status: 1,
                paymentStatus: 1,
                createdAt: 1,
              },
            },
          ],
          topBooks: [
            { $match: { paymentStatus: PaymentStatus.PAID } },
            { $group: { _id: "$bookId", sales: { $sum: 1 } } },
            { $sort: { sales: -1 } },
            { $limit: 5 },

            {
              $lookup: {
                from: "Book",
                localField: "_id",
                foreignField: "_id",
                as: "book",
              },
            },
            {
              $unwind: {
                path: "$book",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                title: "$book.name",
                sales: 1,
                revenue: {
                  $round: [{ $multiply: ["$book.price", "$sales"] }, 2],
                },
                bookId: "$_id",
                price: "$book.price",
              },
            },
          ],
          statusDistribution: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } },
          ],
          paymentDistribution: [
            { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
            { $project: { _id: 0, paymentStatus: "$_id", count: 1 } },
          ],
          chartData: [
            { $match: { createdAt: { $gte: daysAgo(180) } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" },
                },
                orders: { $sum: 1 },
                revenue: { $sum: "$price" },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                monthKey: "$_id",
                month: { $substrBytes: ["$_id", 5, 2] },
                orders: 1,
                revenue: { $round: ["$revenue", 2] },
              },
            },
          ],
        },
      },
    ]),

    Book.countDocuments(librarianId ? { librarianId } : {}),
  ]);

  const facet = orderFacet[0] || {};

  const summary = facet.summary[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    totalCompletedOrder: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
  };

  const totalOrders = summary.totalOrders;

  const averageOrderValue =
    totalOrders > 0 ? Math.round(summary.totalRevenue / totalOrders) : 0;

  const chartData = facet.chartData || [];
  const prevMonth = chartData[chartData.length - 2] || {
    orders: 0,
    revenue: 0,
  };
  const currMonth = chartData[chartData.length - 1] || {
    orders: 0,
    revenue: 0,
  };

  const orderTrend =
    prevMonth.orders > 0
      ? Math.round(
          ((currMonth.orders - prevMonth.orders) / prevMonth.orders) * 100,
        )
      : 0;

  const revenueTrend =
    prevMonth.revenue > 0
      ? Math.round(
          ((currMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100,
        )
      : 0;

  return {
    stats: {
      myBooks: myBooksCount,
      totalOrders,
      totalRevenue: summary.totalRevenue,
      totalCompletedOrder: summary.totalCompletedOrder,
      pendingOrders: summary.pendingOrders,
      monthlyRevenue: summary.monthlyRevenue,
      averageOrderValue,
      orderTrend,
      revenueTrend,
    },
    recentOrders: (facet.recentOrders || []).map(
      (order: Record<string, unknown>) => ({
        id: (order._id as Types.ObjectId).toString(),
        customerName: order.customerName || "Customer",
        customerEmail: order.customerEmail || "",
        bookName: order.bookName || "Unknown Book",
        bookImage: order.bookImage,
        status: order.status,
        paymentStatus: order.paymentStatus,
        date: formatShortDate(order.createdAt as Date),
      }),
    ),
    myTopBooks: (facet.topBooks || []).map((book: Record<string, unknown>) => ({
      title: book.title || "Unknown Book",
      sales: book.sales,
      revenue: `$ ${book.revenue}`,
      bookId: book.bookId,
      price: book.price || 0,
    })),
    chartData: chartData.map((item: Record<string, unknown>) => ({
      month: item.month,
      monthName: formatMonthName(item.monthKey as string),
      orders: item.orders,
      revenue: item.revenue,
    })),
    statusDistribution: toRecord(
      facet.statusDistribution || [],
      "status",
    ) as Record<TOrderStatus, number>,
    paymentDistribution: toRecord(
      facet.paymentDistribution || [],
      "paymentStatus",
    ) as Record<TPaymentStatus, number>,
  };
};

const getAdminDashboardData = async () => {
  const thirtyDaysAgo = daysAgo(30);

  const [orderFacet, userFacet, bookFacet, wishlistCount] = await Promise.all([
    Order.aggregate([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalCompletedOrder: {
                  $sum: {
                    $cond: [{ $eq: ["$status", OrderStatus.DELIVERED] }, 1, 0],
                  },
                },
              },
            },
          ],
          activeUsers: [
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: "$customerId" } },
            { $count: "count" },
          ],
          orderStatusDistribution: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } },
          ],
          paymentStatusDistribution: [
            { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
            { $project: { _id: 0, paymentStatus: "$_id", count: 1 } },
          ],
          recentOrders: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "Book",
                localField: "bookId",
                foreignField: "_id",
                as: "book",
              },
            },
            {
              $lookup: {
                from: "User",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
              },
            },
            {
              $lookup: {
                from: "User",
                localField: "librarianId",
                foreignField: "_id",
                as: "librarian",
              },
            },
            {
              $unwind: {
                path: "$book",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$customer",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$librarian",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                bookId: 1,
                customerName: "$customer.name",
                customerEmail: "$customer.email",
                librarianName: "$librarian.name",
                librarianEmail: "$librarian.email",
                bookName: "$book.name",
                bookImage: "$book.photoUrl",
                amount: "$book.price",
                status: 1,
                paymentStatus: 1,
                createdAt: 1,
              },
            },
          ],
          topBooks: [
            { $group: { _id: "$bookId", sales: { $sum: 1 } } },
            { $sort: { sales: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "Book",
                localField: "_id",
                foreignField: "_id",
                as: "book",
              },
            },
            {
              $unwind: {
                path: "$book",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                title: "$book.name",
                sales: 1,
                author: "$book.author",
                category: "$book.categoryId",
                bookId: "$_id",
                status: "$book.status",
                librarian: "$book.librarianId",
              },
            },
          ],
        },
      },
    ]),

    User.aggregate([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                totalLibrarians: {
                  $sum: {
                    $cond: [{ $eq: ["$role", UserRole.LIBRARIAN] }, 1, 0],
                  },
                },
                totalReaders: {
                  $sum: {
                    $cond: [{ $eq: ["$role", UserRole.USER] }, 1, 0],
                  },
                },
              },
            },
          ],
          recentUsers: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                createdAt: 1,
              },
            },
          ],
          userGrowthChartData: [
            { $match: { createdAt: { $gte: daysAgo(180) } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" },
                },
                totalUsers: { $sum: 1 },
                readers: {
                  $sum: {
                    $cond: [{ $eq: ["$role", UserRole.USER] }, 1, 0],
                  },
                },
                librarians: {
                  $sum: {
                    $cond: [{ $eq: ["$role", UserRole.LIBRARIAN] }, 1, 0],
                  },
                },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                monthKey: "$_id",
                month: { $substrBytes: ["$_id", 5, 2] },
                totalUsers: 1,
                readers: 1,
                librarians: 1,
              },
            },
          ],
        },
      },
    ]),

    Book.aggregate([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalBooks: { $sum: 1 },
              },
            },
          ],
          bookStatusDistribution: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } },
          ],
        },
      },
    ]),

    Favorite.countDocuments(),
  ]);

  const orderSummary = orderFacet[0]?.summary[0] || {
    totalOrders: 0,
    totalCompletedOrder: 0,
  };

  const totalOrders = orderSummary.totalOrders;
  const totalCompletedOrder = orderSummary.totalCompletedOrder;
  const successRate =
    totalOrders > 0 ? Math.round((totalCompletedOrder / totalOrders) * 100) : 0;

  const activeUsers = orderFacet[0]?.activeUsers[0]?.count || 0;

  const userSummary = userFacet[0]?.summary[0] || {
    totalUsers: 0,
    totalLibrarians: 0,
    totalReaders: 0,
  };

  const bookSummary = bookFacet[0]?.summary[0] || { totalBooks: 0 };
  const totalBooks = bookSummary.totalBooks;

  const booksPerLibrarian =
    userSummary.totalLibrarians > 0
      ? Math.round(totalBooks / userSummary.totalLibrarians)
      : 0;

  const avgWishlistPerUser =
    userSummary.totalUsers > 0
      ? Math.round(wishlistCount / userSummary.totalUsers)
      : 0;

  const recentUsers = (userFacet[0]?.recentUsers || []).map(
    (user: Record<string, unknown>) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      joinDate: formatShortDate(user.createdAt as Date),
    }),
  );

  const userGrowthChartData = (userFacet[0]?.userGrowthChartData || []).map(
    (item: Record<string, unknown>) => ({
      month: item.month,
      monthName: formatMonthName(item.monthKey as string),
      totalUsers: item.totalUsers,
      readers: item.readers,
      librarians: item.librarians,
    }),
  );

  return {
    stats: {
      totalBooks,
      totalUsers: userSummary.totalUsers,
      totalOrders,
      activeUsers,
      totalLibrarians: userSummary.totalLibrarians,
      totalReaders: userSummary.totalReaders,
      totalCompletedOrder,
      successRate,
      booksPerLibrarian,
      totalWishlistItems: wishlistCount,
      avgWishlistPerUser,
    },
    recentOrders: (orderFacet[0]?.recentOrders || []).map(
      (order: Record<string, unknown>) => ({
        id: (order._id as Types.ObjectId).toString(),
        bookId: order.bookId,
        customerName: order.customerName || "Customer",
        customerEmail: order.customerEmail || "",
        librarianName: order.librarianName || "Librarian",
        librarianEmail: order.librarianEmail || "",
        bookName: order.bookName || "Unknown Book",
        bookImage: order.bookImage,
        amount: `$ ${order.amount || 0}`,
        status: order.status,
        paymentStatus: order.paymentStatus,
        date: formatShortDate(order.createdAt as Date),
      }),
    ),
    topBooks: orderFacet[0]?.topBooks || [],
    recentUsers,
    userGrowthChartData,
    orderStatusDistribution: toRecord(
      orderFacet[0]?.orderStatusDistribution || [],
      "status",
    ) as Record<TOrderStatus, number>,
    paymentStatusDistribution: toRecord(
      orderFacet[0]?.paymentStatusDistribution || [],
      "paymentStatus",
    ) as Record<TPaymentStatus, number>,
    bookStatusDistribution: toRecord(
      bookFacet[0]?.bookStatusDistribution || [],
      "status",
    ) as Record<TBookStatus, number>,
  };
};

const services = {
  getUserDashboardData,
  getLibrarianDashboardData,
  getAdminDashboardData,
};

export default services;
