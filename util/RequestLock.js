import dotenv from "dotenv";
dotenv.config();

import FileSystem from "./FileSystem.js";
import TimeUtil from "./TimeUtil.js";

const LOCK_PATH = process.env.LOCK_PATH;
const MIN_LOCK_MINUTES = 1;

class RequestLock {
    static getMinutes(lockTarget) {
        const stats = FileSystem.getInfo(lockTarget);
        const createdAt = stats.birthtimeMs;
        const diffMinutes = TimeUtil.diffMinutes(createdAt, TimeUtil.now());
        return diffMinutes;
    }

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

    // static lock(lockID) {
    //     try {
    //         const lockTarget = `${LOCK_PATH}/${lockID}`;
    //         if (!FileSystem.exists(lockTarget)) {
    //             FileSystem.createDir(lockTarget);
    //             return true;
    //         } else if (this.getMinutes(lockTarget) >= MIN_LOCK_MINUTES) {
    //             FileSystem.deleteDir(lockTarget);
    //             FileSystem.createDir(lockTarget);
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     } catch {
    //         return false;
    //     }
    // }

    // static unlock(lockID) {
    //     try {
    //         const lockTarget = `${LOCK_PATH}/${lockID}`;
    //         if (FileSystem.exists(lockTarget)) {
    //             FileSystem.deleteDir(lockTarget);
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     } catch {
    //         return false;
    //     }
    // }
}

export default RequestLock;
