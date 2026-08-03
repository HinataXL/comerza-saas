"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
require("dotenv/config");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'comerza-logos';
const uploadFileToS3 = async (fileBuffer, originalname, mimetype) => {
    const extension = path_1.default.extname(originalname);
    const randomName = crypto_1.default.randomBytes(16).toString('hex');
    const fileName = `products/${randomName}${extension}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimetype,
    });
    await s3Client.send(command);
    // Return the public URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
exports.uploadFileToS3 = uploadFileToS3;
