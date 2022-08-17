require("dotenv").config();
const fs = require("fs");
const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-southeast-1" });
const CONNECTION = new AWS.S3({ apiVersion: "2006-03-01" });

class AmazonS3 {
  static getAllBuckets() {
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

  static getObjects(bucket) {
    return new Promise((resolve, reject) => {
      CONNECTION.listObjects({ Bucket: bucket }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  static createBucket(bucket) {
    return new Promise((resolve, reject) => {
      let params = { Bucket: bucket };
      CONNECTION.createBucket(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
        } else {
          resolve(data);
        }
      });
    });
  }

  static uploadJSON(bucket, key, body) {
    return new Promise((resolve, reject) => {
      const content = JSON.stringify(body);
      const json = {
        Bucket: bucket,
        Key: key,
        Body: content,
      };
      CONNECTION.putObject(json, (err, data) => {
        if (err) {
          console.log(err, err.stack);
        } else {
          resolve(data);
        }
      });
    });
  }

  static uploadFile(bucket, path) {
    return new Promise((resolve, reject) => {
      const content = fs.readFileSync(path);
      const file = {
        Bucket: bucket,
        Key: path,
        Body: content,
      };

      CONNECTION.upload(file, (err, data) => {
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
