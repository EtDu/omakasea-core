import mongoose from "mongoose";

class MongoDB {
    static connect(url) {
        mongoose.set("strictQuery", true);
        return mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }

    static disconnect() {
        mongoose.connection.close();
    }
}

export default MongoDB;
