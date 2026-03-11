declare module 'minio' {
  export class Client {
    constructor(options: {
      endPoint: string;
      port?: number;
      useSSL?: boolean;
      accessKey: string;
      secretKey: string;
    });
    bucketExists(bucketName: string): Promise<boolean>;
    makeBucket(bucketName: string): Promise<void>;
    putObject(
      bucketName: string,
      objectName: string,
      stream: Buffer,
      size: number,
      metaData?: Record<string, string>,
    ): Promise<{ etag: string; versionId?: string }>;
    presignedGetObject(
      bucketName: string,
      objectName: string,
      expiry: number,
    ): Promise<string>;
  }
}
