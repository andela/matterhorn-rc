import { Paystack } from "../../lib/api";
// This is the "wrapper" functions you should write in order to make your code more
// testable. You can either mirror the API calls or normalize them to the authorize/capture/refund/refunds
// that Reaction is expecting
export const PaystackApi = {};
PaystackApi.methods = {};

PaystackApi.methods.refund = new ValidatedMethod({
  name: "PaystackApi.methods.refund",
  validate: new SimpleSchema({
    transactionId: { type: String },
    amount: { type: Number, decimal: true  }
  }).validator(),
  run(args) {
    const transactionId = args.transactionId;
    const amount = args.amount;
    const results = Paystack.refund(transactionId, amount);
    return results;
  }
});


PaystackApi.methods.refunds = new ValidatedMethod({
  name: "PaystackApi.methods.refunds",
  validate: new SimpleSchema({
    transactionId: { type: String }
  }).validator(),
  run(args) {
    const { transactionId } = args;
    const results = ThirdPartyAPI.listRefunds(transactionId);
    return results;
  }
});
