import introJs from "intro.js";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";

const tour = introJs.introJs();
const unregisteredBuyerTour = [
  {
    intro: `<h2>Welcome to <strong>Reaction</strong> Commerce</h2>
    <hr>
    <div class="tourcontainer">
      <strong>Reaction</strong> commerce is the last commerce platform you'll ever need. It's modern with all types of products and services. This brief tour would guide you to understand our platform.
    </div>`
  },
  {
    element: ".product-grid-list",
    intro: `<h2>Products</h2>
    <hr>
    <div>
      We showcase our products here. Have a browse through, add to your cart, and checkout. 
    </div>`
  },
  {
    element: ".search",
    intro: `<h2>Search</h2>
    <hr>
    <div class="tourcontainer">We are large with varieties of products. Our search system will help you expedite that product you are looking for. Find one here!
    </div>`
  },
  {
    element: ".cart",
    intro: `<h2>Cart</h2>
    <hr>
    <div class="tourcontainer">
    This is your cart. You add that product you have been searching for.<br>
      Click on the cart icon and cashout with payment either thorugh:. <br>
      <ol>
        <li>
          <strong>Wallet</strong>
        </li>
        <li>
          <strong>Paystack</strong>
        </li>
      </ol>
    </div>`
  },
  {
    element: ".languages",
    intro: `<h2>Languages</h2>
    <hr>
    <div class="tourcontainer">
      Would you like to shop in your language? <br>
      Just click on language icon and select you preferred language.
    </div>`
  },
  {
    element: ".accounts",
    intro: `<h2>Account Options</h2>
    <hr>
    <div class="tourcontainer">
      To buy a product you would need to either register or sign in and that's pretty easy :<br>
      click on this Icon to reveal a dropdown and follow the instructions.
    </div>`
  },
  {
    element: ".tour",
    intro: `<h2>Tour</h2>
    <hr>
    <div class="tourcontainer">
      That is it. Ever need to take a tour again, you can find me here.
    </div>`
  }
];
const registeredBuyerTour = [
  {
    intro: `<h2>Welcome to <strong>Reaction</strong> Commerce</h2>
    <hr>
    <div class="tourcontainer">
      <strong>Reaction</strong> commerce is the last commerce platform you'll ever need. It's modern with all types of products and services. This brief tour would guide you to understand our platform.
    </div>`
  },
  {
    element: ".product-grid-list",
    intro: `<h2>Products</h2>
    <hr>
    <div>
      We showcase our products here. Have a browse through, add to your cart, and checkout. 
    </div>`
  },
  {
    element: ".search",
    intro: `<h2>Search</h2>
    <hr>
    <div class="tourcontainer">We are large with varieties of products. Our search system will help you expedite that product you are looking for. Find one here!
    </div>`
  },
  {
    element: ".cart",
    intro: `<h2>Cart</h2>
    <hr>
    <div class="tourcontainer">
    This is your cart. You add that product you have been searching for.<br>
      Click on the cart icon and cashout with payment either thorugh:. <br>
      <ol>
        <li>
          <strong>Wallet</strong>
        </li>
        <li>
          <strong>Paystack</strong>
        </li>
      </ol>
    </div>`
  },
  {
    element: ".languages",
    intro: `<h2>Languages</h2>
    <hr>
    <div class="tourcontainer">
      Would you like to shop in your language? <br>
      Just click on language icon and select you preferred language.
    </div>`
  },
  {
    element: ".accounts",
    intro: `<h2>Account Options</h2>
    <hr>
    <div class="tourcontainer">
      To buy a product you would need to either register or sign in and that's pretty easy :<br>
      click on this Icon to reveal a dropdown and follow the instructions.
    </div>`
  },
  {
    element: ".tour",
    intro: `<h2>Tour</h2>
    <hr>
    <div class="tourcontainer">
      That is it. Ever need to take a tour again, you can find me here.
    </div>`
  }
];
const adminTourSteps = [
  {
    intro: `<h2>Welcome to <strong>Reaction</strong> Commerce</h2>
    <hr>
    <div class="tourcontainer">
    <strong>Reaction</strong> commerce is the last commerce platform you'll ever need. It's modern with all types of products and services. This brief tour would guide you to understand our platform.
    </div>`
  },
  {
    element: ".product-grid-list",
    intro: `<h2>Products</h2>
    <hr>
    <div class="tourcontainer">
    We showcase our products here. Have a browse through.
      <br><strong>OR</strong>
      <br>As a Vendor/Admin you can edit, update, delete your products by clicking on them to visit the product detail page.
    </div>`
  },
  {
    element: ".search",
    intro: `<h2>Search</h2>
    <hr>
    <div class="tourcontainer">We are large with varieties of products. Our search system will help you expedite that product you are looking for. Find one here!
    </div>`
  },
  {
    element: ".cart",
    intro: `<h2>Cart</h2>
    <hr>
    <div class="tourcontainer">
    This is your cart. You add that product you have been searching for.<br>
      Click on the cart icon and cashout with payment either thorugh:. <br>
      <ol>
        <li>
          <strong>Wallet</strong>
        </li>
        <li>
          <strong>Paystack</strong>
        </li>
      </ol>
    </div>`
  },
  {
    element: ".languages",
    intro: `<h2>Languages</h2>
    <hr>
    <div class="tourcontainer">
      Would you like to shop in your language? <br>
      Just click on language icon and select you preferred language.
    </div>`
  },
  {
    element: ".accounts",
    intro: `<h2>Account Options</h2>
    <hr>
    <div class="tourcontainer" style="height:200px; overflow-y: scroll;">
      Here we have several other options to help you customize your account, and also get the best out of
      <strong>Reaction</strong> Commerce. Just choose from one of the following options available in the dropdown shown in the screen shot below
      <ol>
        <li>
          <strong>Profile: </strong>view and update your profile details.
        </li>
        <li>
          <strong>Wallet: </strong>  Fund your wallet, transfer funds to other users wallet and lots more.
        </li>
        <li>
          <strong>Dashboard: </strong> View your dashboard. Manage the various packages offered by <strong>Reaction</strong>
        </li>
        <li>
          <strong>Orders: </strong> Checkout orders for your products and carry out actions related to your customers orders
        </li>
        <li>
          <strong>Add Products: </strong> Add new products to your shop
        </li>
        <li>
          <strong>Account: </strong> View and manage accounts of your clients.
        </li>
        <li>
          <strong>Actionable Analytics: </strong> Analyse data from your users and products to guide in making improving
          your market strategies
        </li>
        <li>
          <strong>Sign out: </strong> Though we hate to see you leave, if need arises you can always logout to keep your account
          safe from unathorized access. <br>
          You can always log back in by clicking the same account button next time.
        <l/i>
      <ol>
    </div>`
  },
  {
    element: ".admin-controls-menu",
    intro: `<h2>Admin Controls</h2>
    <hr>
    <div class="tourcontainer" style="height:200px; overflow-y: scroll;">
      There are several functionalities available to you as an Admin/Vendor to futher customize you experience on your store.
      Quick access to this functionalities are available through the controls which appear here.
      Do note that besides the functionalities which appear here, you can view and manage all packages available to you by clicking on the
      dashboard control
    </div>`
  },
  {
    element: ".tour",
    intro: `<h2>Tour</h2>
    <hr>
    <div class="tourcontainer">
      That is it. Ever need to take a tour again, you can find me here.
    </div>`
  }
];

const updateTakenTour = () => {
  if (!Accounts.findOne(Meteor.userId()).takenTour) {
    Accounts.update({ _id: Meteor.userId() }, { $set: { takenTour: true } });
  }
};
export function startTour() {
  let tourSteps;
  if (Reaction.hasPermission("admin")) {
    tourSteps = adminTourSteps;
  } else if (!Reaction.hasPermission("anonymous")) {
    tourSteps = registeredBuyerTour;
  } else {
    tourSteps = unregisteredBuyerTour;
  }
  tour.setOptions({
    showBullets: false,
    showProgress: true,
    scrollToElement: true,
    showStepNumbers: false,
    tooltipPosition: "auto",
    disableInteraction: true,
    overlayOpacity: 0.5,
    steps: tourSteps
  });
  tour.onexit(updateTakenTour)
    .oncomplete(updateTakenTour);
  tour.start();
}
