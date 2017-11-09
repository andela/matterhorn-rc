import _ from "underscore";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

Template.searchFilter.events({
  "change #price-filter"(event) {
    Session.set("priceFilter", event.target.value);
  },
  "change #vendor-filter"(event) {
    Session.set("vendorFilter", event.target.value);
  },
  "change #sort-products"(event) {
    Session.set("sortValue", event.target.value);
  }
});

Template.searchFilter.helpers({
  getVendors(products) {
    return _.uniq(_.pluck(products, "vendor"));
  }
});
