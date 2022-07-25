const fs = require("fs");
const path = require("path");

const EXCLUDE = [".DS_Store"];

class FileSystem {
    static isGif(path) {
        const ext = path.split(".").pop().toLowerCase();
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
            fullPath.substring(0, fullPath.lastIndexOf("/") + 1)
        );

        FileSystem.createDir(targetDir);
    }

    static createDir(fullPath) {
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    }

    static getFiles(dir, files = []) {
        fs.readdirSync(dir).forEach((file) => {
            if (fs.statSync(dir + path.sep + file).isDirectory()) {
                files = FileSystem.getFiles(dir + path.sep + file, files);
            } else if (!EXCLUDE.includes(file)) {
                files.push(path.join(dir, path.sep, file));
            }
        });

        return files;
    }
}

module.exports = FileSystem;
