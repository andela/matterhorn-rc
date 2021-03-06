import _ from "lodash";
import { Template } from "meteor/templating";
import { Orders } from "/lib/collections";
import { formatPriceString } from "/client/api";
import { ReactiveDict } from "meteor/reactive-dict";
import { Tracker } from "meteor/tracker";
import $ from "jquery";

/**
 * Function to fetch the total of all sales made
 * @param {Array} allOrders - Array containing all the orders
 * @return {Object} - an Object containing the necessary overview details
 */
function extractAnalyticsItems(allOrders) {
  let totalSales = 0;
  let ordersCancelled = 0;
  let totalItemsPurchased = 0;
  let totalShippingCost = 0;
  const analytics = {};
  const analyticsStatement = {};
  const ordersAnalytics = [];
  allOrders.forEach((order) => {
    const orderDate = order.createdAt;
    const dateString = orderDate.toISOString().split("T")[0];
    if (order.workflow.status !== "canceled") {
      ordersAnalytics.push({
        date: dateString,
        country: order.billing[0].address.country,
        city: `${order.billing[0].address.city}, ${order.billing[0].address.region}`,
        paymentProcessor: order.billing[0].paymentMethod.processor,
        shipping: order.billing[0].invoice.shipping,
        taxes: order.billing[0].invoice.taxes
      });
      totalSales += order.billing[0].invoice.subtotal;
      totalItemsPurchased += order.items.length;
      totalShippingCost += order.billing[0].invoice.shipping;
      order.items.forEach((item) => {
        if (analytics[item.title]) {
          analytics[item.title].quantitySold += item.quantity;
          analytics[item.title].totalSales += item.variants.price * item.quantity;
        } else {
          analytics[item.title] = {
            quantitySold: item.quantity,
            totalSales: item.variants.price * item.quantity
          };
        }
        const uniqueStamp = `${dateString}::${item.title}`;
        if (analyticsStatement[uniqueStamp] && analyticsStatement[uniqueStamp].title === item.title) {
          analyticsStatement[uniqueStamp].totalSales += item.variants.price * item.quantity;
          analyticsStatement[uniqueStamp].quantity += item.quantity;
        } else {
          analyticsStatement[uniqueStamp] = {
            title: item.title,
            quantity: item.quantity,
            dateString,
            totalSales: item.variants.price * item.quantity
          };
        }
      });
    } else {
      ordersCancelled += 1;
    }
  });
  return { totalSales, totalItemsPurchased, totalShippingCost, analytics, analyticsStatement, ordersAnalytics, ordersCancelled };
}
function getPayment(myAnalytics) {
  const rank = {Paystack: 0, Wallet: 0, Example: 0 };
  const frequency = [];
  const names = [];

  myAnalytics.forEach((analytic) => {
    const key = analytic.paymentProcessor;
    if (rank[key]) {
      rank[key]++;
    } else {
      rank[key] = 1;
    }
  });

  Object.keys(rank).forEach((element) => {
    names.push(element);
    frequency.push(rank[element]);
  });
  return {
    frequency,
    names
  };
}
function getDailySales(statement) {
  const salesObj = {};
  let frequency = [];
  let names = [];
  statement.forEach((analytics) => {
    const data = analytics.dateString;
    let totalSale = 0;
    if (analytics.totalSales) {
      totalSale = analytics.totalSales.replace("₦", "");
      totalSale = totalSale.replace(",", "");
      totalSale = parseFloat(totalSale);
    }

    if (salesObj[data]) {
      salesObj[data] += totalSale;
    } else {
      salesObj[data] = totalSale;
    }
  });
  Object.keys(salesObj).forEach((element) => {
    names.push(element);
    frequency.push(salesObj[element]);
  });
  frequency = frequency.reverse();
  names = names.reverse();
  console.log(names, "+++++++++++++++++++");
  return {
    frequency,
    names
  };
}
function bestSelling(myAnalytics) {
  const products = [];
  const analytics = myAnalytics;
  Object.keys(analytics).forEach((key) => {
    products.push({
      product: key,
      quantitySold: analytics[key].quantitySold
    });
  });
  return _.orderBy(
    products,
    product => product.quantitySold,
    "desc"
  );
}
function topEarning(myAnalytics) {
  const products = [];
  const analytics = myAnalytics;
  Object.keys(analytics).forEach((key) => {
    products.push({
      product: key,
      salesSorter: analytics[key].totalSales,
      totalSales: formatPriceString(analytics[key].totalSales)
    });
  });
  return _.orderBy(
    products,
    product => product.salesSorter,
    "desc"
  );
}
function statementsAnalysis(myAnalytics) {
  const statements = [];
  const analyticsStatement = myAnalytics;

  Object.keys(analyticsStatement).forEach((key) => {
    statements.push(analyticsStatement[key]);
    analyticsStatement[key].totalSales = formatPriceString(analyticsStatement[key].totalSales);
  });
  return _.orderBy(
    statements,
    statement => Date.parse(statement.dateString),
    "desc"
  );
}
function drawChart(chartData) {
  if (chartData) {
    const analytics = chartData.ordersAnalytics;
    const topSells = bestSelling(chartData.analytics);
    const topEarns = topEarning(chartData.analytics);
    const statements = statementsAnalysis(chartData.analyticsStatement);
    const dailySales = getDailySales(statements);
    // Sales Graph
    const canvas4 = document.getElementById("salesGraph");
    // Chart
    const canvas = document.getElementById("salesChart");
    const canvas2 = document.getElementById("topSeller");
    const canvas3 = document.getElementById("topEarner");
    const salesChart = canvas.getContext("2d");
    const topSeller = canvas2.getContext("2d");
    const topEarner = canvas3.getContext("2d");
    const saleGraph = canvas4.getContext("2d");

    // canvas width
    canvas.width = 400;
    canvas2.width = 400;
    canvas3.width = 400;
    canvas4.width = window.innerWidth * 0.9;
    // canvas height
    canvas.height = 300;
    canvas2.height = 300;
    canvas3.height = 300;
    canvas4.height = 300;
    // Set the options
    const options = {

      // /Boolean - Whether grid lines are shown across the chart
      scaleShowGridLines: true,

      // String - Colour of the grid lines
      scaleGridLineColor: "rgba(0,0,0,.05)",

      // Number - Width of the grid lines
      scaleGridLineWidth: 1,

      // Boolean - Whether to show horizontal lines (except X axis)
      scaleShowHorizontalLines: true,

      // Boolean - Whether to show vertical lines (except Y axis)
      scaleShowVerticalLines: true,

      // Boolean - Whether the line is curved between points
      bezierCurve: true,

      // Number - Tension of the bezier curve between points
      bezierCurveTension: 0.4,

      // Boolean - Whether to show a dot for each point
      pointDot: true,

      // Number - Radius of each point dot in pixels
      pointDotRadius: 4,

      // Number - Pixel width of point dot stroke
      pointDotStrokeWidth: 1,

      // Number - amount extra to add to the radius to cater for hit detection outside the drawn point
      pointHitDetectionRadius: 20,

      // Boolean - Whether to show a stroke for datasets
      datasetStroke: true,

      // Number - Pixel width of dataset stroke
      datasetStrokeWidth: 2,

      // Boolean - Whether to fill the dataset with a colour
      datasetFill: true,

      // String - A legend template
      legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };
    // Set the data
    const data = {
      labels: getPayment(analytics).names,
      datasets: [{
        label: "My First dataset",
        fillColor: "rgba(200,220,220,0.9)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: getPayment(analytics).frequency
      }]
    };
    // Set the data
    const data2 = {
      labels: dailySales.names,
      datasets: [{
        label: "My First dataset",
        fillColor: "rgba(200,220,220,0.9)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: dailySales.frequency
      }]
    };
    const pieData = [];
    for (let i = 0; i < topSells.length; i += 1) {
      pieData.push({
        value: topSells[i].quantitySold,
        color: `rgba(${i * 220},220,220, 0.8)`,
        highlight: "#FF5A5E",
        label: topSells[i].product
      });
    }
    const earnersData = [];
    for (let i = 0; i < topEarns.length; i += 1) {
      earnersData.push({
        value: topEarns[i].salesSorter,
        color: `rgba(${i * 220},200,220, ${(i + 1) * 0.5})`,
        highlight: "#FF5A5E",
        label: topEarns[i].product
      });
    }
    // draw the charts
    new Chart(salesChart).Bar(data, options);
    new Chart(topSeller).Pie(pieData);
    new Chart(topEarner).Doughnut(earnersData);
    new Chart(saleGraph).Line(data2, options);
  }
}
/**
 * Helper function to calculate the differnce (in days)
 * between 2 dates
 * @param{Object} date1 - older date1 in milliseconds
 * @param{Object} date2 - recent date in milliseconds
 * @return{Number} - Difference between date2 and date1 in days (Number of days between date2 and date1)
 */
function daysDifference(date1, date2) {
  // a Day represented in milliseconds
  const oneDay = 1000 * 60 * 60 * 24;
  // Calculate the difference in milliseconds
  const difference = new Date(new Date(date2).setHours(23)) - new Date(new Date(date1).setHours(0));
  // Convert back to days and return
  return Math.round(difference / oneDay);
}


/**
 * Helper method to set up the average sales total
 * @param{Number} totalSales - total sales
 * @param{Date} fromDate - start date
 * @param{toDate} toDate - end date
 * @return{Number} sales per day
 */
function setUpAverageSales(totalSales, fromDate, toDate) {
  const difference = daysDifference(Date.parse(fromDate), Date.parse(toDate));
  const salesPerDay = difference === 0 ? totalSales : totalSales / difference;
  return salesPerDay;
}
Template.rcAnalytics.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    ordersPlaced: 0,
    beforeDate: new Date(),
    afterDate: new Date(),
    totalSales: 0,
    totalItemsPurchased: 0,
    ordersCancelled: 0,
    totalShippingCost: 0,
    salesPerDay: 0,
    analytics: {},
    analyticsStatement: {},
    ordersAnalytics: [],
    productsAnalytics: []
  });
  const self = this;
  self.autorun(() => {
    const orderSub = self.subscribe("Orders");
    if (orderSub.ready()) {
      const allOrders = Orders.find({
        createdAt: {
          $gte: new Date(self.state.get("beforeDate").setHours(0)),
          $lte: new Date(self.state.get("afterDate").setHours(23))
        }
      }).fetch();
      if (allOrders) {
        const analyticsItems = extractAnalyticsItems(allOrders);
        self.state.set("ordersPlaced", allOrders.length);
        self.state.set("totalSales", analyticsItems.totalSales);
        self.state.set("totalItemsPurchased", analyticsItems.totalItemsPurchased);
        self.state.set("totalShippingCost", analyticsItems.totalShippingCost);
        self.state.set("analytics", analyticsItems.analytics);
        self.state.set("analyticsStatement", analyticsItems.analyticsStatement);
        self.state.set("ordersAnalytics", analyticsItems.ordersAnalytics);
        self.state.set("ordersCancelled", analyticsItems.ordersCancelled);
        self.state.set("salesPerDay",
          setUpAverageSales(self.state.get("totalSales"),
            self.state.get("beforeDate"),
            self.state.get("afterDate")));
        const salesPerDay = setUpAverageSales(self.state.get("totalSales"),
          self.state.get("beforeDate"),
          self.state.get("afterDate"));
        const chartData = {
          ordersPlaced: allOrders.length,
          totalSales: analyticsItems.totalSales,
          totalItemsPurchased: analyticsItems.totalItemsPurchased,
          totalShippingCost: analyticsItems.totalShippingCost,
          analytics: analyticsItems.analytics,
          analyticsStatement: analyticsItems.analyticsStatement,
          ordersAnalytics: analyticsItems.ordersAnalytics,
          ordersCancelled: analyticsItems.ordersCancelled,
          salesPerDay: salesPerDay
        };
        drawChart(chartData);
      }
    }
  });
});
Template.rcAnalytics.onRendered(() => {
  const instance = Template.instance();
  let fromDatePicker = {};
  const toDatePicker = new Pikaday({ // eslint-disable-line no-undef
    field: $("#todatepicker")[0],
    format: "DD/MM/YYYY",
    onSelect() {
      const nextDate = this.getDate();
      instance.state.set("afterDate", nextDate);
    }
  });

  fromDatePicker = new Pikaday({ // eslint-disable-line no-undef
    field: $("#fromdatepicker")[0],
    format: "DD/MM/YYYY",
    onSelect() {
      toDatePicker.setMinDate(this.getDate());
      const nextDate = this.getDate();
      if (Date.parse(toDatePicker.getDate()) < Date.parse(nextDate)) {
        toDatePicker.setDate(nextDate);
      } else {
        instance.state.set("beforeDate", this.getDate());
      }
    }
  });
  fromDatePicker.setMaxDate(new Date());
  toDatePicker.setMaxDate(new Date());
  fromDatePicker.setDate(new Date());
  toDatePicker.setDate(fromDatePicker.getDate());
  Tracker.autorun(() => {
    drawChart();
  });
});
Template.rcAnalytics.helpers({
  ordersPlaced() {
    const instance = Template.instance();
    const orders = instance.state.get("ordersPlaced");
    return orders - Template.instance().state.get("ordersCancelled");
  },
  totalSales() {
    const instance = Template.instance();
    return formatPriceString(instance.state.get("totalSales"));
  },
  totalItemsPurchased() {
    const instance = Template.instance();
    return instance.state.get("totalItemsPurchased");
  },
  totalShippingCost() {
    const instance = Template.instance();
    return formatPriceString(instance.state.get("totalShippingCost"));
  },
  salesPerDay() {
    const instance = Template.instance();
    return formatPriceString(instance.state.get("salesPerDay"));
  },
  bestSelling() {
    const products = [];
    const instance = Template.instance();
    const analytics = instance.state.get("analytics");
    Object.keys(analytics).forEach((key) => {
      products.push({
        product: key,
        quantitySold: analytics[key].quantitySold
      });
    });
    return _.orderBy(
      products,
      product => product.quantitySold,
      "desc"
    );
  },
  topEarning() {
    const products = [];
    const instance = Template.instance();
    const analytics = instance.state.get("analytics");
    Object.keys(analytics).forEach((key) => {
      products.push({
        product: key,
        salesSorter: analytics[key].totalSales,
        totalSales: formatPriceString(analytics[key].totalSales)
      });
    });
    return _.orderBy(
      products,
      product => product.salesSorter,
      "desc"
    );
  },
  statements() {
    const statements = [];
    const instance = Template.instance();
    const analyticsStatement = instance.state.get("analyticsStatement");

    Object.keys(analyticsStatement).forEach((key) => {
      statements.push(analyticsStatement[key]);
      analyticsStatement[key].totalSales = formatPriceString(analyticsStatement[key].totalSales);
    });
    return _.orderBy(
      statements,
      statement => Date.parse(statement.dateString),
      "desc"
    );
  },
  orders() {
    const instance = Template.instance();
    const orders = instance.state.get("ordersAnalytics");
    return _.orderBy(
      orders,
      (order) => {
        const currentOrder = order;
        currentOrder.taxes = formatPriceString(currentOrder.taxes);
        currentOrder.shipping = formatPriceString(currentOrder.shipping);
        return Date.parse(currentOrder.date);
      },
      "desc"
    );
  },
  products() {
    const instance = Template.instance();
    const productsAnalytics = instance.state.get("productsAnalytics");
    return _.orderBy(productsAnalytics,
      product => product.views,
      "desc"
    );
  },
  ordersCancelled() {
    return Template.instance().state.get("ordersCancelled");
  }
});
