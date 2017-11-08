import { Template } from "meteor/templating";

Template.emptySearch.helpers({
  noResults(searchTerm, products) {
    if (searchTerm.length > 0 && products.length < 1) {
      return true;
    }
    return false;
  }
});
