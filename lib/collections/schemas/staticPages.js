import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Random } from "meteor/random";

/**
* Reaction Schemas StaticPages
*/
export const StaticPages = new SimpleSchema({
  _id: {
    type: String,
    defaultValue: Random.id(),
    optional: true
  },
  pageName: {
    label: "Page Name",
    type: String
  },
  pageAddress: {
    label: "Page URL Address",
    type: String
  },
  pageContent: {
    label: "Page Content",
    type: String
  },
  userId: {
    label: "User Identification",
    type: String
  },
  shopId: {
    label: "Shop Identification",
    type: String
  },
  isEnabled: {
    label: "Show page link on nav bar.",
    type: Boolean
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      }
      return {
        $setOnInsert: new Date
      };
    }
  },
  updatedAt: {
    type: Date,
    optional: true
  }
});
