const mongoose = require("mongoose");

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
