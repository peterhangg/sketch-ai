import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../../config";

interface s3UploadUrlProps {
  key: string;
  acl?: "public-read" | "private";
  options?: { expiresIn?: number };
}

export const s3 = new S3Client({
  region: config.s3.region,
  credentials: config.s3.credentials,
});

export const getFileUploadUrl = async ({
  key,
  acl = "public-read",
  options: { expiresIn = 3600 } = {},
}: s3UploadUrlProps): Promise<{ signedUrl: string }> => {
  const command = new PutObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
    ACL: acl,
  });
  const signedUrl = await getSignedUrl(s3, command, { expiresIn });
  return { signedUrl };
};

export const deleteFile = async (key: string): Promise<boolean> => {
  const command = new DeleteObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
  });

  try {
    await s3.send(command);
    return true;
  } catch (error) {
    console.error(`Error deleting file: ${error}`);
    return false;
  }
};
