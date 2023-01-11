import dotenv from "dotenv";
dotenv.config();

import FileSystem from "./FileSystem.js";

const LOCK_PATH = process.env.LOCK_PATH;

class RequestLock {
    static hasLock(lockID) {
        const lockTarget = `${LOCK_PATH}/${lockID}`;
        return FileSystem.exists(lockTarget);
    }

    static lock(lockID) {
        const lockTarget = `${LOCK_PATH}/${lockID}`;
        if (!FileSystem.exists(lockTarget)) {
            FileSystem.createDir(lockTarget);
            return true;
        } else {
            return false;
        }
    }

    static unlock(lockID) {
        const lockTarget = `${LOCK_PATH}/${lockID}`;
        if (FileSystem.exists(lockTarget)) {
            FileSystem.deleteDir(lockTarget);
            return true;
        } else {
            return false;
        }
    }
}

export default RequestLock;
