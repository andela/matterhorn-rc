import moment from "moment";
import { Template } from "meteor/templating";
import { Orders, Shops, Products } from "/lib/collections";

/**
 * dashboardOrdersList helpers
 *
 */
Template.dashboardOrdersList.helpers({
  orderStatus() {
    if (this.workflow.status === "coreOrderCompleted") {
      return true;
    }
  },
  getProductUrl() {
    const productId = this.items[0].productId;
    const getProductData = Meteor.subscribe("Product", productId);
    if (getProductData.ready()) {
      const product = Products.findOne(productId);
      return product.productUrl;
    }
    return null;
  },
  isDigital() {
    const productId = this.items[0].productId;
    const getProductData = Meteor.subscribe("Product", productId);
    if (getProductData.ready()) {
      const product = Products.findOne(productId);
      return product.isDigital;
    }
    return null;
  },
  orders(data) {
    if (data.hash.data) {
      return data.hash.data;
    }
    return Orders.find({}, {
      sort: {
        createdAt: -1
      },
      limit: 25
    });
  },
  orderAge() {
    return moment(this.createdAt).fromNow();
  },
  shipmentTracking() {
    return this.shipping[0].shipmentMethod.tracking;
  },
  shopName() {
    const shop = Shops.findOne(this.shopId);
    return shop !== null ? shop.name : void 0;
  }
});
