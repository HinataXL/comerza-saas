import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;

const getS3Client = () => {
  if (!s3Client) {
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    const bucketName = process.env.AWS_S3_BUCKET || '';

    if (!accessKeyId || !secretAccessKey || !bucketName) {
      console.warn('AWS S3 credentials not fully configured in environment variables.');
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3Client;
};

export const uploadImageToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  mimetype: string
): Promise<string> => {
  const bucketName = process.env.AWS_S3_BUCKET || '';
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET is not defined');
  }

  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await client.send(command);

  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
};
