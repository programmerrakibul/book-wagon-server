const { ObjectId } = require("mongodb");
const {
  ordersCollection,
  wishlistCollection,
  booksCollection,
  usersCollection,
} = require("../config/db.js");

const getUserDashboardData = async (req, res) => {
  const { email } = req.params;

  if (!email.trim()) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    const orders = await ordersCollection
      .find({ customerEmail: email })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const wishlist = await wishlistCollection.findOne({ customerEmail: email });
    const wishlistBooks = wishlist?.bookIDs || [];

    const wishlistBookIds = wishlistBooks.map((id) => new ObjectId(id));
    const wishlistBooksData =
      wishlistBookIds.length > 0
        ? await booksCollection
            .find({ _id: { $in: wishlistBookIds } })
            .limit(5)
            .toArray()
        : [];

    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (order) => order.status === "delivered",
    ).length;
    const totalBooksPurchased = orders.reduce(
      (sum, order) => sum + (order.quantity || 1),
      0,
    );

    const orderIds = orders
      .filter((order) => order.paymentStatus === "paid")
      .map((order) => new ObjectId(order.bookId));
    const orderBooks =
      orderIds.length > 0
        ? await booksCollection.find({ _id: { $in: orderIds } }).toArray()
        : [];

    const bookPriceMap = {};
    orderBooks.forEach((book) => {
      bookPriceMap[book._id.toString()] = book.price || 0;
    });

    const totalSpent = orders.reduce((sum, order) => {
      if (order.paymentStatus === "paid") {
        const price = bookPriceMap[order.bookId] || 0;
        const quantity = order.quantity || 1;
        sum += price * quantity;
      }
      return sum;
    }, 0);

    const recentOrders = await Promise.all(
      orders.slice(0, 5).map(async (order) => {
        const book = await booksCollection.findOne({
          _id: new ObjectId(order.bookId),
        });
        return {
          id: order.orderID,
          bookName: book?.bookName || "Unknown Book",
          bookImage: book?.bookImage,
          amount: `৳ ${book?.price || 0}`,
          paymentStatus: order.paymentStatus,
          date: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        };
      }),
    );

    const monthlyData = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { orders: 0, amount: 0 };
      }

      monthlyData[monthYear].orders++;
      const bookPrice = bookPriceMap[order.bookId] || 0;
      monthlyData[monthYear].amount += bookPrice * (order.quantity || 1);
    });

    const chartData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: month.split("-")[1],
        orders: data.orders,
        amount: data.amount,
      }))
      .sort((a, b) => parseInt(a.month) - parseInt(b.month))
      .slice(-6);

    const statusDistribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

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
      data: {
        stats: {
          totalOrders,
          wishlistItems: wishlistBooks.length,
          booksPurchased: totalBooksPurchased,
          completedOrders,
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
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getLibrarianDashboardData = async (req, res) => {
  const { email } = req.params;

  if (!email.trim()) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    const allOrders = await ordersCollection
      .find({ librarianEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    const myBooks = await booksCollection
      .find({ librarianEmail: email })
      .toArray();

    const totalOrders = allOrders.length;
    const myBooksCount = myBooks.length;

    const orderBookIds = [
      ...new Set(allOrders.map((order) => new ObjectId(order.bookId))),
    ];
    const orderBooks = await booksCollection
      .find({ _id: { $in: orderBookIds } })
      .toArray();

    const bookPriceMap = {};
    orderBooks.forEach((book) => {
      bookPriceMap[book._id.toString()] = book.price || 0;
    });

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    allOrders.forEach((order) => {
      const price = bookPriceMap[order.bookId] || 0;
      const quantity = order.quantity || 1;
      const revenue = price * quantity;

      totalRevenue += revenue;

      const orderDate = new Date(order.createdAt);
      if (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      ) {
        monthlyRevenue += revenue;
      }
    });

    const statusCounts = allOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const completedOrders = statusCounts.delivered || 0;
    const pendingOrders = statusCounts.pending || 0;

    const recentOrders = await Promise.all(
      allOrders.slice(0, 8).map(async (order) => {
        const book = await booksCollection.findOne({
          _id: new ObjectId(order.bookId),
        });
        const customer = await usersCollection.findOne({
          email: order.customerEmail,
        });

        return {
          id: order.orderID,
          customerName: order.customerName || customer?.name || "Customer",
          customerEmail: order.customerEmail,
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

    const bookSales = {};
    allOrders.forEach((order) => {
      const quantity = order.quantity || 1;
      bookSales[order.bookId] = (bookSales[order.bookId] || 0) + quantity;
    });

    const sortedBookIds = Object.entries(bookSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => new ObjectId(id));

    const topBooks = await booksCollection
      .find({ _id: { $in: sortedBookIds } })
      .toArray();

    const myTopBooks = topBooks.map((book) => {
      const sales = bookSales[book._id.toString()] || 0;
      const revenue = (book.price || 0) * sales;
      return {
        title: book.bookName,
        sales,
        revenue: `৳ ${revenue}`,
        bookId: book._id.toString(),
        price: book.price || 0,
      };
    });

    const monthlyData = {};
    allOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { orders: 0, revenue: 0 };
      }

      monthlyData[monthYear].orders++;
      const bookPrice = bookPriceMap[order.bookId] || 0;
      monthlyData[monthYear].revenue += bookPrice * (order.quantity || 1);
    });

    const chartData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: month.split("-")[1],
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

    const paymentDistribution = allOrders.reduce((acc, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
      return acc;
    }, {});

    res.send({
      success: true,
      data: {
        stats: {
          myBooks: myBooksCount,
          totalOrders,
          totalRevenue,
          completedOrders,
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
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getAdminDashboardData = async (req, res) => {
  try {
    const [allBooks, allOrders, allUsers, allWishlists] = await Promise.all([
      booksCollection.find({}).toArray(),
      ordersCollection.find({}).sort({ createdAt: -1 }).toArray(),
      usersCollection.find({}).toArray(),
      wishlistCollection.find({}).toArray(),
    ]);

    const totalBooks = allBooks.length;
    const totalUsers = allUsers.length;
    const totalOrders = allOrders.length;
    const totalLibrarians = allUsers.filter(
      (user) => user.role === "librarian",
    ).length;
    const totalReaders = allUsers.filter((user) => user.role === "user").length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = new Set(
      allOrders
        .filter((order) => new Date(order.createdAt) > thirtyDaysAgo)
        .map((order) => order.customerEmail),
    ).size;

    const orderStatusCounts = allOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const paymentStatusCounts = allOrders.reduce((acc, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
      return acc;
    }, {});

    const recentOrders = await Promise.all(
      allOrders.slice(0, 10).map(async (order) => {
        const book = await booksCollection.findOne({
          _id: new ObjectId(order.bookId),
        });
        const customer = await usersCollection.findOne({
          email: order.customerEmail,
        });
        const librarian = await usersCollection.findOne({
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
          quantity: order.quantity || 1,
        };
      }),
    );

    const bookSales = {};
    allOrders.forEach((order) => {
      const quantity = order.quantity || 1;
      bookSales[order.bookId] = (bookSales[order.bookId] || 0) + quantity;
    });

    const sortedBookIds = Object.entries(bookSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => new ObjectId(id));

    const topBooks = await booksCollection
      .find({ _id: { $in: sortedBookIds } })
      .toArray();

    const formattedTopBooks = topBooks.map((book) => {
      const sales = bookSales[book._id.toString()] || 0;
      return {
        title: book.bookName,
        sales,
        author: book.author,
        category: book.category,
        bookId: book._id.toString(),
        status: book.status,
        librarian: book.librarianEmail,
      };
    });

    const monthlyUserData = {};
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
      if (user.role === "user") {
        monthlyUserData[monthYear].readers++;
      } else if (user.role === "librarian") {
        monthlyUserData[monthYear].librarians++;
      }
    });

    const userGrowthChartData = Object.entries(monthlyUserData)
      .map(([month, data]) => ({
        month: month.split("-")[1],
        monthName: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
        }),
        totalUsers: data.total,
        readers: data.readers,
        librarians: data.librarians,
      }))
      .sort((a, b) => parseInt(a.month) - parseInt(b.month))
      .slice(-6);

    const bookStatusDistribution = allBooks.reduce((acc, book) => {
      acc[book.status] = (acc[book.status] || 0) + 1;
      return acc;
    }, {});

    const completedOrders = orderStatusCounts.delivered || 0;
    const successRate =
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    const booksPerLibrarian =
      totalLibrarians > 0 ? Math.round(totalBooks / totalLibrarians) : 0;

    const totalWishlistItems = allWishlists.reduce(
      (sum, wishlist) => sum + (wishlist.bookIDs?.length || 0),
      0,
    );
    const avgWishlistPerUser =
      totalUsers > 0 ? Math.round(totalWishlistItems / totalUsers) : 0;

    const recentUsers = allUsers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((user) => ({
        name: user.name || user.email,
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
      data: {
        stats: {
          totalBooks,
          totalUsers,
          totalOrders,
          activeUsers,
          totalLibrarians,
          totalReaders,
          completedOrders,
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
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  getUserDashboardData,
  getLibrarianDashboardData,
  getAdminDashboardData,
};
