const fs = require("fs");
const path = require("path");

const EXCLUDE = [".DS_Store"];

class FileSystem {
    static getName(fPath) {
        return fPath.split(path.sep).pop().split(".")[0];
    }

    static isGif(filePath) {
        const ext = filePath.split(".").pop().toLowerCase();
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
            .filter((f) => !EXCLUDE.includes(f))
            .sort()
            .pop();
        const baseDir = `${fullPath}/${latest}`;
        return FileSystem.getFiles(baseDir);
    }
}

module.exports = FileSystem;
