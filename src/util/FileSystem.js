const fs = require("fs");
const path = require("path");

const EXCLUDE = [".DS_Store"];

class FileSystem {
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
