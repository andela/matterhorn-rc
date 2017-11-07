import { StaticPages } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * Static Pages
 */

Meteor.publish("StaticPages", function () {
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return StaticPages.find({
    shopId: shopId
  });
});

Meteor.publish("viewPages", function () {
  return StaticPages.find({});
});
