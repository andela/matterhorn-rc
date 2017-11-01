import React, {Component} from "react";
import FileUploader from "react-firebase-file-uploader";
// import firebase from "firebase";
// import config from "../config";

// firebase.initializeApp(config);

class ProductUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploading: false,
      progress: 0,
      productUrl: " "
    };
    this.handleUploadStart = this
      .handleUploadStart
      .bind(this);
    this.handleUploadError = this
      .handleUploadError
      .bind(this);
    this.handleProgress = this
      .handleProgress
      .bind(this);
  }

  handleUploadStart = () => this.setState({isUploading: true, progress: 0});
  handleProgress = (progress) => this.setState({progress});
  handleUploadError = (error) => {
    this.setState({isUploading: false});
    console.error(error);
  }


  render() {
    const fontStyle = {
      color: "green",
      fontSize: "40px"
    };
    return (
      <div>
        {this.state.progress === 100 && <p><i style={fontStyle} className="fa fa-check" aria-hidden="true" /></p>
}
        <FileUploader
          name="products"
          randomizeFilename
          storageRef={this.props.storageRef}
          onUploadStart={this.handleUploadStart}
          onUploadError={this.handleUploadError}
          onUploadSuccess={this.props.handleUploadSuccess}
          onProgress={this.handleProgress}
        />
      </div>
    );
  }
}

export default ProductUpload;
