import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import ms from 'ms';
import type { UseCase } from '../../../core/use-case';

export interface FileRetrieveFromS3Input {
  bucketName: string;
  filename: string;
  /** e.g. '7 days' */
  expire?: string;
}

export interface FileRetrieveFromS3Output {
  url: string;
}

@Injectable()
export class FileRetrieveFromS3UseCase implements UseCase<
  FileRetrieveFromS3Input,
  FileRetrieveFromS3Output
> {
  constructor(private readonly config: ConfigService) {}

  async execute(
    input: FileRetrieveFromS3Input,
  ): Promise<FileRetrieveFromS3Output> {
    const { bucketName, filename, expire } = input;

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

    const defaultMs = 7 * 24 * 60 * 60 * 1000;
    const durationMs =
      expire !== undefined && expire !== ''
        ? ms(expire as unknown as import('ms').StringValue)
        : defaultMs;
    const seconds = Math.floor(durationMs / 1000);
    const url = await client.presignedGetObject(bucketName, filename, seconds);

    return { url };
  }
}
