require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.update({ region: "ap-southeast-1" });
const CONNECTION = new AWS.S3({ apiVersion: "2006-03-01" });

class AmazonS3 {
  static getBuckets() {
    return new Promise((resolve, reject) => {
      CONNECTION.listBuckets((err, node) => {
        if (err) {
          console.log("Error", err);
        } else {
          resolve(node.Buckets);
        }
      });
    });
  }

  static getObjects(name) {
    return new Promise((resolve, reject) => {
      CONNECTION.listObjects({ Bucket: name }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  static createBucket(name) {
    return new Promise((resolve, reject) => {
      let params = { Bucket: name };
      CONNECTION.createBucket(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
        } else {
          resolve(data);
        }
      });
    });
  }

  static writeJSON(data) {
    return new Promise((resolve, reject) => {
      CONNECTION.putObject(data, (err, data) => {
        if (err) {
          console.log(err, err.stack);
        } else {
          resolve(data);
        }
      });
    });
  }

  static __DELETE_JSON__(data) {
    return new Promise((resolve, reject) => {
      CONNECTION.deleteObject(data, (err, data) => {
        if (err) {
          console.log(err, err.stack);
        } else {
          resolve(data);
        }
      });
    });
  }

  static __DELETE_BUCKET__(name) {
    return new Promise((resolve, reject) => {
      let params = { Bucket: name };
      storage.deleteBucket(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
        } else {
          resolve(data);
        }
      });
    });
  }
}

module.exports = AmazonS3;
