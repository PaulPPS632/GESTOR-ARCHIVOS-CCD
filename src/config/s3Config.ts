import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

export const s3 = new S3Client({
    endpoint: process.env.ENDPOINT_URL,
    region: "auto",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_KEY!,
    },
    forcePathStyle: true,
});

export const BUCKET_NAME = process.env.BUCKET_NAME!;