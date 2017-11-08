import { ProductDetailContainer } from "../containers";
import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";

Template.productDetailSimple.helpers({
  opts: function () {
    const currentPage = window.location.href;
    const opts = {
      facebook: true,
      twitter: true,
      pinterest: false,
      shareData: {
        url: currentPage
      }
    };
    return opts;
  },
  isEnabled() {
    return isRevisionControlEnabled();
  },
  PDC() {
    return ProductDetailContainer;
  }
});
