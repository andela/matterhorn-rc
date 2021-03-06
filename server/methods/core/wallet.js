import { Wallets, Accounts } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas/";
import { check } from "meteor/check";

Meteor.methods({
  "wallet/refund/list": (order) => {
    check(order, Object);
    const orders = Wallets.find({ orderId: order._id});
    return orders;
  },
  "wallet/transaction": (userId, transactions) => {
    check(userId, String);
    check(transactions, Schemas.Transaction);
    let balanceOptions;
    const { amount, transactionType } = transactions;
    if (transactionType === "Credit") {
      balanceOptions = { balance: amount };
    }
    if (transactionType === "Credit") {
      newBalance = { balance: transactions.amount };
    }
    if (transactions.transactionType === "Debit") {
      if (transactions.to) {
        const recipient = Accounts.findOne({ "emails.address": transactions.to });
        const sender = Accounts.findOne(userId);
        if (!recipient) {
          return 2;
        }
               // deposit for the recipient
        Meteor.call("wallet/transaction", recipient._id, {
          amount,
          from: sender.emails[0].address,
          date: new Date(),
          transactionType: "Credit"
        });
      }
      balanceOptions = { balance: -amount };
    }

    try {
      Wallets.update({ userId }, { $push: { transactions: transactions },
        $inc: balanceOptions }, { upsert: true });
      return 1;
    } catch (error) {
      return 0;
    }
  }
});
