/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
import * as Collections from "/lib/collections";
// reaction modules
import { Reaction } from "/server/api";
import { PaystackApi } from "./paystackApi";

Meteor.methods({
   /**
 +    * submit payment
 +    * @description gets paystack api keys
 +    * @return {Object} returns the paystack keys
 +    */
  "paystack/getKeys"() {
    const paystack = Collections.Packages.findOne({
      name: "paystack",
      shopId: Reaction.getShopId()
    });
    return {
      public: paystack.settings.publicKey,
      secret: paystack.settings.secretKey
    };
  },

   /**
   * Create a refund
   * @param  {Object} paymentMethod object
   * @param  {Number} amount The amount to be refunded
   * @return {Object} result
   */
  "paystack/refund/create": function (paymentMethod, amount) {
    console.log(paymentMethod);
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    check(amount, Number);
    const { transactionId } = paymentMethod;
    const response = PaystackApi.methods.refund.call({
      transactionId: transactionId,
      amount: amount
    });
    const results = {
      saved: true,
      response: response
    };
    return results;
  },
  /**
  * List refunds
  * @param  {Object} paymentMethod Object containing the pertinant data
  * @return {Object} result
  */
  "paystack/refund/list": function (paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    const { transactionId } = paymentMethod;
    const response = PaystackApi.methods.refunds.call({
      transactionId: transactionId
    });
    const result = [];
    for (const refund of response.refunds) {
      result.push(refund);
    }

   // The results retured from the GenericAPI just so happen to look like exactly what the dashboard
   // wants. The return package should ba an array of objects that look like this
   // {
   //   type: "refund",
   //   amount: Number,
   //   created: Number: Epoch Time,
   //   currency: String,
   //   raw: Object
   // }
    const emptyResult = [];
    return emptyResult;
  }
});
