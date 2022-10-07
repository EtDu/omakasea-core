import mongoose from "mongoose";

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

export default MongoDB;
