require("money");
require("autonumeric");
import accounting from "accounting-js";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { i18next, Logger, formatNumber } from "/client/api";
import { NumericInput } from "/imports/plugins/core/ui/client/components";
import { Media, Orders, Shops, Wallets } from "/lib/collections";
import _ from "lodash";

//
// core order shipping invoice templates
//
Template.coreOrderShippingInvoice.onCreated(function () {
  this.state = new ReactiveDict();

  // template.orderDep = new Tracker.Dependency;
  this.refunds = new ReactiveVar([]);
  this.refundAmount = new ReactiveVar(0.00);

  // function getOrder(orderId) {
  //   template.orderDep.depend();
  //   return Orders.findOne(orderId);
  // }

  this.autorun(() => {
    const currentData = Template.currentData();
    const order = Orders.findOne(currentData.orderId);
    const shop = Shops.findOne({});

    this.state.set("order", order);
    this.state.set("currency", shop.currencies[shop.currency]);

    // template.order = getOrder(currentData.orderId);
    if (order) {
      const paymentMethod = order.billing[0].paymentMethod;
      Meteor.call("orders/refunds/list", order, (error, result) => {
        if (!error) {
          this.refunds.set(result);
        }
      });
    }
  });
});

/**
 * coreOrderAdjustments events
 */
Template.coreOrderShippingInvoice.events({
  /**
   * Submit form
   * @param  {Event} event - Event object
   * @param  {Template} instance - Blaze Template
   * @return {void}
   */
  "submit form[name=capture]": (event, instance) => {
    event.preventDefault();

    const state = instance.state;
    const order = state.get("order");
    const orderTotal = accounting.toFixed(
      order.billing[0].invoice.subtotal
      + order.billing[0].invoice.shipping
      + order.billing[0].invoice.taxes
      , 2);
    const discount = state.get("field-discount") || 0;

    if (discount > orderTotal) {
      Alerts.inline("Discount cannot be greater than original total price", "error", {
        placement: "coreOrderShippingInvoice",
        i18nKey: "order.invalidDiscount",
        autoHide: 10000
      });
    } else if (orderTotal === accounting.toFixed(discount, 2)) {
      Alerts.alert({
        title: i18next.t("order.fullDiscountWarning"),
        showCancelButton: true,
        confirmButtonText: i18next.t("order.applyDiscount")
      }, (isConfirm) => {
        if (isConfirm) {
          Meteor.call("orders/approvePayment", order, discount, (error) => {
            if (error) {
              Logger.warn(error);
            }
          });
        }
      });
    } else {
      Meteor.call("orders/approvePayment", order, discount, (error) => {
        if (error) {
          Logger.warn(error);
          if (error.error === "orders/approvePayment.discount-amount") {
            Alerts.inline("Discount cannot be greater than original total price", "error", {
              placement: "coreOrderShippingInvoice",
              i18nKey: "order.invalidDiscount",
              autoHide: 10000
            });
          }
        }
      });
    }
  },

  /**
   * Submit form
   * @param  {Event} event - Event object
   * @param  {Template} instance - Blaze Template
   * @return {void}
   */
  "submit form[name=refund]": (event, instance) => {
    event.preventDefault();

    const { state } = Template.instance();
    const currencySymbol = state.get("currency").symbol;
    const order = instance.state.get("order");
    const orderTotal = order.billing[0].paymentMethod.amount;
    const paymentMethod = order.billing[0].paymentMethod;
    const discounts = order.billing[0].invoice.discounts;
    const refund = state.get("field-refund") || 0;
    let refundTotal = 0;
    let adjustedTotal;
    const shipmentAmount = order.shipping[0].shipmentMethod.rate;
    const shipment = order.shipping[0];
    const shipped = _.every(shipment.items, (shipmentItem) => {
      for (const fullItem of order.items) {
        if (fullItem._id === shipmentItem._id) {
          if (fullItem.workflow) {
            if (_.isArray(fullItem.workflow.workflow)) {
              return _.includes(fullItem.workflow.workflow, "coreOrderItemWorkflow/completed");
            }
          }
        }
      }
    });
    if (shipped) {
      refundTotal = orderTotal - shipmentAmount;
    }
    // Stripe counts discounts as refunds, so we need to re-add the discount to not "double discount" in the adjustedTotal
    if (paymentMethod.processor === "Stripe") {
      adjustedTotal = accounting.toFixed(orderTotal + discounts - refundTotal);
    } else {
      adjustedTotal = accounting.toFixed(orderTotal - refundTotal);
    }

    if (adjustedTotal > orderTotal) {
      Alerts.inline("Adjusted total cannot be greater than order total", "error", {
        placement: "coreOrderRefund",
        i18nKey: "order.invalidRefund",
        autoHide: 10000
      });
    } else {
      Alerts.alert({
        title: i18next.t("order.applyRefundToThisOrder", { refund: accounting.toFixed(refund), currencySymbol: currencySymbol }),
        showCancelButton: true,
        confirmButtonText: i18next.t("order.applyRefund")
      }, (isConfirm) => {
        if (isConfirm) {
          Meteor.call("orders/refunds/create", order._id, paymentMethod, refund, (error) => {
            if (error) {
              Alerts.alert(error.reason);
            }
            state.set("field-refund", 0);
            Alerts.alert("Refund Successful");
          });
        }
      });
    }
  },

  "click [data-event-action=makeAdjustments]": (event, instance) => {
    event.preventDefault();
    Meteor.call("orders/makeAdjustmentsToInvoice", instance.state.get("order"));
  },

  "click [data-event-action=capturePayment]": (event, instance) => {
    event.preventDefault();
    const order = instance.state.get("order");
    Meteor.call("orders/capturePayments", order._id);
  },

  "change input[name=refund_amount], keyup input[name=refund_amount]": (event, instance) => {
    instance.refundAmount.set(accounting.unformat(event.target.value));
  }
});


/**
 * coreOrderShippingInvoice helpers
 */
Template.coreOrderShippingInvoice.helpers({
  NumericInput() {
    return NumericInput;
  },

  numericInputProps(fieldName, value = 0, enabled = true) {
    const { state } = Template.instance();
    const order = state.get("order");
    const status = order.billing[0].paymentMethod.status;
    const isApprovedAmount = (status === "approved" || status === "completed");

    return {
      component: NumericInput,
      numericType: "currency",
      value: value,
      disabled: !enabled,
      isEditing: !isApprovedAmount, // Dont allow editing if its approved
      format: state.get("currency"),
      classNames: {
        input: {amount: true},
        text: {
          "text-success": status === "completed"
        }
      },
      onChange(event, data) {
        state.set(`field-${fieldName}`, data.numberValue);
      }
    };
  },

  refundInputProps() {
    const { state } = Template.instance();
    const order = state.get("order");
    const paymentMethod = order.billing[0].paymentMethod;
    const orderTotal = paymentMethod.amount;
    const shipmentAmount = order.shipping[0].shipmentMethod.rate;
    const shipment = order.shipping[0];
    const shipped = _.every(shipment.items, (shipmentItem) => {
      for (const fullItem of order.items) {
        if (fullItem._id === shipmentItem._id) {
          if (fullItem.workflow) {
            if (_.isArray(fullItem.workflow.workflow)) {
              return _.includes(fullItem.workflow.workflow, "coreOrderItemWorkflow/completed");
            }
          }
        }
      }
    });
    let refundTotal = orderTotal;
    if (shipped) {
      refundTotal = orderTotal - shipmentAmount;
    }

    const adjustedTotal = refundTotal;
    state.set("field-refund", refundTotal);
    return {
      component: NumericInput,
      numericType: "currency",
      value: refundTotal,
      maxValue: adjustedTotal,
      format: state.get("currency"),
      classNames: {
        input: {amount: true}
      },
      onChange(event) {
        event.preventDefault();
        state.set("field-refund", refundTotal);
      }
    };
  },

  refundAmount() {
    return Template.instance().refundAmount;
  },
  /**
   * Discount
   * @return {Number} current discount amount
   */
  invoice() {
    const instance = Template.instance();
    const order = instance.state.get("order");

    return order.billing[0].invoice;
  },

  isCancelled() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    if (order.workflow.status === "canceled" ||
      order.workflow.status === "coreOrderWorkflow/canceled") {
      return true;
    }
    return false;
  },

  isRefunded() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    if (order.refunded === true) {
      return true;
    }
    return false;
  },

  money(amount) {
    return formatNumber(amount);
  },

  disabled() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const status = order.billing[0].paymentMethod.status;

    if (status === "approved" || status === "completed") {
      return "disabled";
    }

    return "";
  },

  paymentPendingApproval() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const status = order.billing[0].paymentMethod.status;

    return status === "created" || status === "adjustments" || status === "error";
  },

  canMakeAdjustments() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const status = order.billing[0].paymentMethod.status;

    if (status === "approved" || status === "completed") {
      return false;
    }
    return true;
  },

  paymentApproved() {
    const instance = Template.instance();
    const order = instance.state.get("order");

    return order.billing[0].paymentMethod.status === "approved";
  },

  paymentCaptured() {
    const instance = Template.instance();
    const order = instance.state.get("order");

    return order.billing[0].paymentMethod.status === "completed";
  },

  refundTransactions() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const transactions = order.billing[0].paymentMethod.transactions;
    return _.filter(transactions, (transaction) => {
      return transaction.type === "refund";
    });
  },

  refunds() {
    const refunds = Template.instance().refunds.get();

    if (_.isArray(refunds)) {
      return refunds.reverse();
    }

    return false;
  },

  /**
   * Get the total after all refunds
   * @return {Number} the amount after all refunds
   */
  adjustedTotal() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const paymentMethod = order.billing[0].paymentMethod;
    const discounts = order.billing[0].invoice.discounts;
    let refundTotal = 0;
    const shipmentAmount = order.shipping[0].shipmentMethod.rate;
    const shipment = order.shipping[0];
    const shipped = _.every(shipment.items, (shipmentItem) => {
      for (const fullItem of order.items) {
        if (fullItem._id === shipmentItem._id) {
          if (fullItem.workflow) {
            if (_.isArray(fullItem.workflow.workflow)) {
              return _.includes(fullItem.workflow.workflow, "coreOrderItemWorkflow/completed");
            }
          }
        }
      }
    });
    if (shipped) {
      refundTotal = paymentMethod.amount - shipmentAmount;
    }

    if (paymentMethod.processor === "Stripe") {
      return Math.abs(paymentMethod.amount + discounts - refundTotal);
    }
    return Math.abs(paymentMethod.amount - refundTotal);
  },

  refundSubmitDisabled() {
    const amount = Template.instance().state.get("field-refund") || 0;
    if (amount === 0) {
      return "disabled";
    }

    return null;
  },

  /**
   * Order
   * @summary find a single order using the order id spplied with the template
   * data context
   * @return {Object} A single order
   */
  order() {
    const instance = Template.instance();
    const order = instance.state.get("order");

    return order;
  },

  shipment() {
    const instance = Template.instance();
    const order = instance.state.get("order");

    const shipment = _.filter(order.shipping, {_id: currentData.fulfillment._id})[0];

    return shipment;
  },

  items() {
    const instance = Template.instance();
    const order = instance.state.get("order");
    const currentData = Template.currentData();
    const shipment = currentData.fulfillment;

    const items = _.map(shipment.items, (item) => {
      const originalItem = _.find(order.items, {
        _id: item._id
      });
      return _.extend(originalItem, item);
    });

    return items;
  },

  /**
   * Media - find meda based on a variant
   * @param  {String|Object} variantObjectOrId A variant of a product or a variant Id
   * @return {Object|false}    An object contianing the media or false
   */
  media(variantObjectOrId) {
    let variantId = variantObjectOrId;

    if (typeof variant === "object") {
      variantId = variantObjectOrId._id;
    }

    const defaultImage = Media.findOne({
      "metadata.variantId": variantId,
      "metadata.priority": 0
    });

    if (defaultImage) {
      return defaultImage;
    }

    return false;
  }
});
