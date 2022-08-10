const mongoose = require("mongoose");

const Collection = require("./models/Collection");
const CollectionSchema = require("./schemas/CollectionSchema");

class MongoDB {
  static connect(url) {
    return mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  static disconnect() {
    mongoose.connection.close();
  }
}

module.exports = MongoDB;
