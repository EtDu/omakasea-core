import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR;
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR;
const TRANSCODE_DIR = process.env.TRANSCODE_DIR;

const EXCLUDE = [".DS_Store", "__MACOSX"];

class FileSystem {
    static getInfo(file) {
        return fs.statSync(file);
    }

    static open(file) {
        return JSON.parse(fs.readFileSync(file));
    }

    static createdAt(file) {
        const { birthtime } = fs.statSync(file);
        return birthtime;
    }

    static getExtension(file) {
        const toks = file.split(".");
        return toks[toks.length - 1];
    }

    static getUploadPath(video) {
        const { uuid, extension } = video;
        return `${UPLOAD_DIR}/${uuid}.${extension}`;
    }

    static getDownloadPath(video) {
        const { uuid, extension } = video;
        return `${DOWNLOAD_DIR}/${uuid}.${extension}`;
    }

    static getTranscodePath(video) {
        const { uuid, extension } = video;
        return `${TRANSCODE_DIR}/${uuid}.${extension}`;
    }

    static delete(fPath) {
        try {
            fs.unlinkSync(fPath);
        } catch (_) {}
    }

    static getName(fPath) {
        return fPath.split(path.sep).pop();
    }

    static isGif(fPath) {
        const ext = fPath.split(".").pop().toLowerCase();
        return ext === "gif";
    }

    static createGenerateDir(parentDir) {
        FileSystem.createDir(parentDir);
        const files = fs.readdirSync(parentDir);
        const batch = `BATCH_${files.length + 1}`;
        const generateDir = `${parentDir}/${batch}`;
        FileSystem.createDir(generateDir);
        return generateDir;
    }

    static splitPath(target) {
        const toks = target.split(path.sep);
        const file = toks[toks.length - 1];

        if (file.includes(".")) {
            const extension = file.split(".")[1];
            toks.pop();
            return {
                file,
                extension,
                path: toks.join(path.sep),
            };
        }
    }

    static createParentDir(fullPath) {
        const targetDir = path.join(
            "./",
            fullPath.substring(0, fullPath.lastIndexOf("/") + 1),
        );

        FileSystem.createDir(`/${targetDir}`);
    }

    static exists(fullPath) {
        return fs.existsSync(fullPath);
    }

    static createDir(fullPath) {
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    }

    static deleteDir(fullPath) {
        if (fs.existsSync(fullPath)) {
            fs.rmdirSync(fullPath);
        }
    }

    static __exclude__(file) {
        let exclude = false;
        for (const exclusion of EXCLUDE) {
            if (file.includes(exclusion)) {
                exclude = true;
            }
        }
        return exclude;
    }

    static getFiles(dir, files = []) {
        fs.readdirSync(dir).forEach((file) => {
            if (fs.statSync(dir + path.sep + file).isDirectory()) {
                files = FileSystem.getFiles(dir + path.sep + file, files);
            } else if (!this.__exclude__(file)) {
                const fPath = path.join(dir, path.sep, file);
                const fName = FileSystem.getName(fPath);
                files.push({ fName, fPath });
            }
        });

        return files;
    }

    static getGenerated(uploadId) {
        const fullPath = `${process.env.GENERATED_DIR}/${uploadId}`;
        const list = fs.readdirSync(fullPath);
        const latest = list
            .filter((f) => !this.__exclude__(f))
            .sort()
            .pop();
        const baseDir = `${fullPath}/${latest}`;
        return FileSystem.getFiles(baseDir);
    }
}

export default FileSystem;
