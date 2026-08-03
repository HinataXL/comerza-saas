import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import 'dotenv/config';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'comerza-logos';

export const uploadFileToS3 = async (fileBuffer: Buffer, originalname: string, mimetype: string): Promise<string> => {
  const extension = path.extname(originalname);
  const randomName = crypto.randomBytes(16).toString('hex');
  const fileName = `products/${randomName}${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  // Return the public URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
