const { ObjectId } = require("mongodb");
const {
  ordersCollection,
  wishlistCollection,
  booksCollection,
  usersCollection,
} = require("../db.js");

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
      (order) => order.status === "delivered"
    ).length;
    const totalBooksPurchased = orders.reduce(
      (sum, order) => sum + (order.quantity || 1),
      0
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
      })
    );

    const monthlyData = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
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
  } catch (error) {
    console.error("Dashboard error:", error);
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
          bookImage:
            book?.bookImage,
          amount: `৳ ${book?.price || 0}`,
          status: order.status,
          paymentStatus: order.paymentStatus,
          date: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        };
      })
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
        date.getMonth() + 1
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
              100
          )
        : 0;

    const revenueTrend =
      previousMonthData.revenue > 0
        ? Math.round(
            ((currentMonthData.revenue - previousMonthData.revenue) /
              previousMonthData.revenue) *
              100
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
  } catch (error) {
    console.error("Librarian dashboard error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  getUserDashboardData,
  getLibrarianDashboardData,
};
