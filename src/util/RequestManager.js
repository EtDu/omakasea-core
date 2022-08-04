class RequestManager {
  static __filter__(data, schema) {
    let fields = {};
    for (const key of Object.keys(data)) {
      if (key in schema) {
        fields[key] = data[key];
      }
    }
    return fields;
  }

  static filterRequestData(req, schema) {
    return new Promise((resolve, reject) => {
      let data = null;
      if (req.method === "GET") {
        data = req.query;
      } else if (req.method === "POST") {
        data = req.body;
      }

      if (data === null) {
        reject(req);
      } else {
        resolve(this.__filter__(data, schema));
      }
    });
  }
}

module.exports = RequestManager;
