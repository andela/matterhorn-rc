import { StaticPages } from "/lib/collections";
import { Template } from "meteor/templating";

Template.staticPageView.onCreated(function () {
  this.autorun(() => {
    this.subscribe("StaticPages");
  });
});

Template.staticPageView.helpers({
  staticPage(pageAddress) {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      const page = StaticPages.find({pageAddress, isEnabled: true}).fetch();
      if (page.length > 0) {
        const pageContent = page[0].pageContent;
        return ([{title: page[0].pageName, content: pageContent }]);
      }
    }
  }
});
