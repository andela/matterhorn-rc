import moment from "moment";
import { Template } from "meteor/templating";
import { Orders, Shops } from "/lib/collections";
import { i18next } from "/client/api";

/**
 * dashboardOrdersList helpers
 *
 */
Template.dashboardOrdersList.helpers({
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
  orderStatus() {
    if (this.workflow.status === "coreOrderCompleted" || this.workflow.status === "coreOrderWorkflow/completed") {
      return "Completed";
    }  else if (this.workflow.status === "canceled") {
      return "Canceled";
    }
    return "Processing";
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
  },
  hasComment() {
    return this.comments.length > 0;
  }
});
