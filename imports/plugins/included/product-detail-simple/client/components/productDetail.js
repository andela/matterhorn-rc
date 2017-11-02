import React, {Component, PropTypes} from "react";
import firebase from "firebase";
import config from "../config";

import {
  Button,
  Currency,
  DropDownMenu,
  MenuItem,
  Translation,
  Toolbar,
  ToolbarGroup
} from "/imports/plugins/core/ui/client/components/";
import {AddToCartButton, ProductMetadata, ProductTags, ProductField} from "./";
import {AlertContainer} from "/imports/plugins/core/ui/client/containers";
import {PublishContainer} from "/imports/plugins/core/revisions";

import ProductUpload from "./digitalProduct";

firebase.initializeApp(config);


class ProductDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productUrl: " ",
      progress: 0,
      isUploading: false,
      errorMessage: {},
      isAnalogue: true
    };
    this.handleUploadSuccess = this
      .handleUploadSuccess
      .bind(this);
    this.handleChange = this
      .handleChange
      .bind(this);
  }

  handleUploadSuccess = (filename) => {
    this.setState({productUrl: filename, progress: 100, isUploading: false});
    firebase
      .storage()
      .ref("products")
      .child(filename)
      .getDownloadURL()
      .then((url) => {
        this.setState({productUrl: url});
        this.props.onProductFieldChange(this.product._id, "productUrl", this.state.productUrl);
        this.props.onProductFieldChange(this.product._id, "isDigital", true);
      });
  };

  handleChange(event) {
    const value = event.target.value;

    value === "Analogue" ? this.setState({ isAnalogue: true }) : this.setState({ isAnalogue: false });
  }

  get tags() {
    return this.props.tags || [];
  }

  get product() {
    return this.props.product || {};
  }

  get editable() {
    return this.props.editable;
  }

  handleProductError = (error) => {
    if (error) {
      const errorField = error.reason.split(" ")[1].toLowerCase();
      this.setState({
        errorMessage: {
          [errorField]: `${error.reason}`
        }
      });
    } else {
      this.setState({
        errorMessage: {}
      });
    }
  }

  handleVisibilityChange = (event, isProductVisible) => {
    if (this.props.onProductFieldChange) {
      this
        .props
        .onProductFieldChange(this.product._id, "isVisible", isProductVisible);
    }
  }

  handlePublishActions = (event, action) => {
    if (action === "archive" && this.props.onDeleteProduct) {
      this
        .props
        .onDeleteProduct(this.product._id);
    }
  }

  renderToolbar() {
    if (this.props.hasAdminPermission) {
      return (
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <Translation defaultValue="Product Management" i18nKey="productDetail.productManagement" />
          </ToolbarGroup>
          <ToolbarGroup>
            <DropDownMenu
              buttonElement={< Button label = "Switch" />}
              onChange={this.props.onViewContextChange}
              value={this.props.viewAs}
            >
              <MenuItem label="Administrator" value="administrator"/>
              <MenuItem label="Customer" value="customer"/>
            </DropDownMenu>
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            <PublishContainer
              documentIds={[this.product._id]}
              documents={[this.product]}
              onVisibilityChange={this.handleVisibilityChange}
              onAction={this.handlePublishActions}
              handleProductError={this.handleProductError}
            />
          </ToolbarGroup>
        </Toolbar>
      );
    }

    return null;
  }

  render() {
    return (
      <div className="" style={{
        position: "relative"
      }}
      >
      {this.renderToolbar()}

      <div
        className="container-main container-fluid pdp-container"
        itemScope
        itemType="http://schema.org/Product"
      >
        <AlertContainer placement="productManagement"/>

        <header className="pdp header">
          <ProductField
            editable={this.editable}
            fieldName="title"
            fieldTitle="Title"
            element={< h1 />}
            onProductFieldChange={this.props.onProductFieldChange}
            product={this.product}
            textFieldProps={{
              i18nKeyPlaceholder: "productDetailEdit.title",
              placeholder: "Title",
              helpText: this.state.errorMessage.title
            }}
          />

          <ProductField
            editable={this.editable}
            fieldName="pageTitle"
            fieldTitle="Sub Title"
            element={< h2 />}
            onProductFieldChange={this.props.onProductFieldChange}
            product={this.product}
            textFieldProps={{
              i18nKeyPlaceholder: "productDetailEdit.pageTitle",
              placeholder: "Subtitle"
            }}
          />
        </header>

        <div className="pdp-content">
          <div className="pdp column left pdp-left-column">
            {this.props.mediaGalleryComponent}
            <ProductTags
              editable={this.props.editable}
              product={this.product}
              tags={this.tags}
            />
            <ProductMetadata editable={this.props.editable} product={this.product}/>
          </div>

          <div className="pdp column right pdp-right-column">

            <div className="pricing">
              <div className="left">
                <span className="price">
                  <span id="price">
                    <Currency amount={this.props.priceRange}/>
                  </span>
                </span>
              </div>


              <div className="vendor">
                <ProductField
                  editable={this.editable}
                  fieldName="vendor"
                  fieldTitle="Vendor"
                  onProductFieldChange={this.props.onProductFieldChange}
                  product={this.product}
                  textFieldProps={{
                    i18nKeyPlaceholder: "productDetailEdit.vendor",
                    placeholder: "Vendor",
                    helpText: this.state.errorMessage.vendor
                  }}
                />
              </div>

              <div className="pdp product-info">
                <ProductField
                  editable={this.editable}
                  fieldName="description"
                  fieldTitle="Description"
                  multiline={true}
                  onProductFieldChange={this.props.onProductFieldChange}
                  product={this.product}
                  textFieldProps={{
                    i18nKeyPlaceholder: "productDetailEdit.description",
                    placeholder: "Description",
                    helpText: this.state.errorMessage.description
                  }}
                />
              </div>
            </div>

            <div className="vendor">
              <ProductField
                editable={this.editable}
                fieldName="vendor"
                fieldTitle="Vendor"
                onProductFieldChange={this.props.onProductFieldChange}
                product={this.product}
                textFieldProps={{
                  i18nKeyPlaceholder: "productDetailEdit.vendor",
                  placeholder: "Vendor"
                }}
              />
            </div>

            <div className="pdp product-info">
              <ProductField
                editable={this.editable}
                fieldName="description"
                fieldTitle="Description"
                multiline={true}
                onProductFieldChange={this.props.onProductFieldChange}
                product={this.product}
                textFieldProps={{
                  i18nKeyPlaceholder: "productDetailEdit.description",
                  placeholder: "Description",
                  helpText: this.state.errorMessage.description
                }}
              />
              <label htmlFor="productType">Product Type</label>
              <select className="form-control"
                id="productType"
                name="productType"
                onChange={this.handleChange}
              >
                <option>Analogue</option>
                <option>Digital</option>
              </select>
           { !this.state.isAnalogue &&
            <div><p />
            <label>{this.state.progress < 100 && <p>Upload digital product</p>}</label>
            <label>{this.state.progress === 100 && <p>Upload successful</p>}</label>
           <ProductUpload
             handleUploadSuccess={this.handleUploadSuccess}
             storageRef = {firebase.storage().ref("products")}
           /></div>}
          </div>

          <div className="options-add-to-cart">
            {this.props.topVariantComponent}
          </div>
          <hr/>
          <div>
            <AlertContainer placement="productDetail"/>
            <AddToCartButton
              cartQuantity={this.props.cartQuantity}
              onCartQuantityChange={this.props.onCartQuantityChange}
              onClick={this.props.onAddToCart}
            />
          </div>
        </div>
      </div>
    </div>
    </div>
    );
  }
}

ProductDetail.propTypes = {
  cartQuantity: PropTypes.number,
  editable: PropTypes.bool,
  hasAdminPermission: PropTypes.bool,
  mediaGalleryComponent: PropTypes.node,
  onAddToCart: PropTypes.func,
  onCartQuantityChange: PropTypes.func,
  onDeleteProduct: PropTypes.func,
  onProductFieldChange: PropTypes.func,
  onViewContextChange: PropTypes.func,
  priceRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  product: PropTypes.object,
  socialComponent: PropTypes.node,
  tags: PropTypes.arrayOf(PropTypes.object),
  topVariantComponent: PropTypes.node,
  viewAs: PropTypes.string
};

export default ProductDetail;
