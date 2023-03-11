import dotenv from "dotenv";
dotenv.config();

import {
    PutObjectCommand,
    CreateBucketCommand,
    DeleteBucketCommand,
    GetObjectCommand,
    ListBucketsCommand,
    ListObjectsCommand,
    DeleteObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { fstat, promises as fs } from "fs";
import path from "path";

const {
    DIGITAL_OCEAN_SPACES_ENDPOINT,
    DIGITAL_OCEAN_SPACES_ACCESS_KEY,
    DIGITAL_OCEAN_SPACES_SECRET,
} = process.env;

class FileBucket {
    constructor() {
        this.s3Client = new S3Client({
            endpoint: DIGITAL_OCEAN_SPACES_ENDPOINT, // Find your endpoint in the control panel, under Settings. Prepend "https://".
            forcePathStyle: false, // Configures to use subdomain/virtual calling format.
            region: "us-east-1", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
            credentials: {
                accessKeyId: DIGITAL_OCEAN_SPACES_ACCESS_KEY, // Access key pair. You can create access key pairs using the control panel or API.
                secretAccessKey: DIGITAL_OCEAN_SPACES_SECRET, // Secret access key defined through an environment variable.
            },
        });
    }

    async createBucket(name) {
        const bucketParams = { Bucket: name };
        const data = await this.s3Client.send(
            new CreateBucketCommand(bucketParams),
        );
        console.log("Bucket Created: ", data.location);
    }

    async deleteBucket(name) {
        const bucketParams = { Bucket: name };
        const data = await this.s3Client.send(
            new DeleteBucketCommand(bucketParams),
        );
        console.log("Bucket Deleted: ", data.location);
    }

    async listBuckets() {
        const data = await this.s3Client.send(new ListBucketsCommand({}));
        console.log("Bucket list:", data.Buckets);
    }

    async listBucketContents(name) {
        const bucketParams = { Bucket: name };
        const data = await this.s3Client.send(
            new ListObjectsCommand(bucketParams),
        );
        const fileNames = data.Contents.map((content) => content.Key);
        console.log(`Bucket Contents For ${name}:`, fileNames);
        return data.Contents;
    }

    async walk(rootPath, bucketName) {
        const dir = await fs.readdir(rootPath);
        for (let item of dir) {
            const filePath = path.join(rootPath, item);
            const stat = await fs.stat(filePath);
            if (stat.isFile()) {
                await this.uploadSingle(filePath, rootPath, bucketName);
            } else if (stat.isDirectory()) {
                await this.walk(filePath, bucketName);
            }
        }
    }

    async uploadSingle(filePath, rootPath, bucketName) {
        const bucketPath = filePath.substring(rootPath.length + 1);
        console.log(bucketPath);
        const file = await fs.readFile(filePath);
        const uploadParams = {
            Bucket: bucketName,
            Key: bucketPath,
            Body: file,
            ACL: "private",
            Metadata: { fileName: path.basename(filePath) },
        };
        const data = await this.s3Client.send(
            new PutObjectCommand(uploadParams),
        );
    }

    async uploadAssetDir(rootPath, bucketName) {
        this.walk(rootPath, bucketName);
    }

    async deleteItem(name, key) {
        const bucketParams = {
            Bucket: name,
            Key: key,
        };

        await this.s3Client.send(new DeleteObjectCommand(bucketParams));
        console.log("Deleted: ", key);
    }

    async emptybucket(name) {
        const contents = await this.listBucketContents(name);
        for (let item of contents) {
            await this.deleteItem(name, item.Key);
        }
    }

    // streamToString(stream) {
    //     const chunks = [];
    //     return new Promise((resolve, reject) => {
    //         stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    //         stream.on("error", (err) => reject(err));
    //         stream.on("end", () =>
    //             resolve(Buffer.concat(chunks).toString("utf8")),
    //         );
    //     });
    // }

    async downloadItem(fileName, bucketName) {
        const bucketParams = {
            Bucket: bucketName,
            Key: fileName,
        };
        try {
            const response = await this.s3Client.send(
                new GetObjectCommand(bucketParams),
            );
            return response.Body;
        } catch (e) {
            return null;
        }
        // const data = await streamToString(response.Body);
    }
}

export default FileBucket;
