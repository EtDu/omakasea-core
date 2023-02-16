import express from "express";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

class Responses {
    constructor(name, port, corsConfig) {
        this.app = express();
        if (process.env.LOCAL_DEV_MODE == "true") {
            console.log("Local Dev mode, applying CORS");
            this.app.use(cors());
        }
        if (corsConfig) this.app.use(cors(corsConfig));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(logger("dev"));
        this.name = name;
        this.port = port;
    }

    get(path, action) {
        this.app.get(path, action);
    }

    post(path, action) {
        this.app.post(path, action);
    }

    start() {
        if (process.env.LOCAL_DEV_MODE == "true") {
            this.app.listen(this.port, "0.0.0.0", () => {
                console.log(`${this.name} running on 0.0.0.0:${this.port}`);
            });
        } else {
            this.app.listen(this.port, () => {
                console.log(`${this.name} running on ${this.port}`);
            });
        }
    }

    setViews(engine, dir) {
        this.app.set("view engine", engine);
        this.app.set("views", dir);
    }

    setPublic(dir) {
        this.app.use(express.static(dir));
    }
}

export default Responses;
