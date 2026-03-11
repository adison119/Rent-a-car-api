import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import type { UseCase } from '../../../core/use-case';

export interface FileUploadToS3Input {
  bucketName: string;
  file: {
    fileName: string;
    size: number;
    buffer: Buffer;
    mimetype: string;
  };
}

export type FileUploadToS3Output = boolean;

@Injectable()
export class FileUploadToS3UseCase implements UseCase<
  FileUploadToS3Input,
  FileUploadToS3Output
> {
  constructor(private readonly config: ConfigService) {}

  async execute(input: FileUploadToS3Input): Promise<FileUploadToS3Output> {
    const { bucketName, file } = input;

    const endpoint = this.config.getOrThrow<string>('S3_ENDPOINT');
    const port = Number(this.config.get('S3_PORT') ?? 9000);
    const useSSL = this.config.get('S3_USE_SSL') === 'true';
    const accessKey = this.config.getOrThrow<string>('S3_ACCESS_KEY');
    const secretKey = this.config.getOrThrow<string>('S3_SECRET_KEY');

    const client = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    const exists = await client.bucketExists(bucketName);
    if (!exists) {
      await client.makeBucket(bucketName);
    }

    await client.putObject(bucketName, file.fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    return true;
  }
}
