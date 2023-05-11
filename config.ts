export const config = {
  replicate: {
    apiBaseUrl:
      process.env.REPLICATE_BASE_API_URL! || "https://api.replicate.com",
    apiKey: process.env.REPLICATE_API_KEY!,
    modelVersion:
      "435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
  },
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify" } },
      allowDangerousEmailAccountLinking: true,
    },
  },
  s3: {
    region: process.env.AWS_S3_BUCKET_REGION!,
    bucketName: process.env.AWS_S3_BUCKET_NAME!,
    baseObjectUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_BUCKET_REGION}.amazonaws.com`,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    defaultFolder: process.env.S3_DEFAULT_FOLDER || "sketches",
  },
};
