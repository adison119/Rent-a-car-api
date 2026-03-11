import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { UseCase } from '../../../../core/use-case';
import type { FileRepository } from '../../../ports/file.repository';
import { FILE_REPOSITORY } from '../../../ports/tokens';
import { FileUploadToS3UseCase } from '../upload-to-s3';
import { FileRetrieveFromS3UseCase } from '../retrieve-from-s3';

export interface FileUploadCommandInput {
  file: Express.Multer.File;
  createdById: string | null;
}

export interface FileUploadCommandOutput {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

@Injectable()
export class FileUploadCommand implements UseCase<
  FileUploadCommandInput,
  FileUploadCommandOutput
> {
  constructor(
    @Inject(FILE_REPOSITORY) private readonly fileRepository: FileRepository,
    private readonly config: ConfigService,
    private readonly fileUploadToS3: FileUploadToS3UseCase,
    private readonly fileRetrieveFromS3: FileRetrieveFromS3UseCase,
  ) {}

  async execute(
    input: FileUploadCommandInput,
  ): Promise<FileUploadCommandOutput> {
    const { file, createdById } = input;

    if (!file?.buffer) {
      throw new BadRequestException('FILE_NOT_FOUND');
    }

    const bucketName = this.config.get<string>('S3_BUCKET') ?? 'files';
    const ext = file.originalname?.includes('.')
      ? file.originalname.split('.').pop()
      : '';
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext ? `.${ext}` : ''}`;

    await this.fileUploadToS3.execute({
      bucketName,
      file: {
        fileName,
        size: file.size,
        buffer: file.buffer,
        mimetype: file.mimetype ?? 'application/octet-stream',
      },
    });

    const { url } = await this.fileRetrieveFromS3.execute({
      bucketName,
      filename: fileName,
      expire: '7 days',
    });

    const fileEntity = await this.fileRepository.create({
      bucketName,
      fileName,
      mimeType: file.mimetype ?? 'application/octet-stream',
      size: file.size,
      url,
      createdById: createdById ?? undefined,
    });

    return {
      id: fileEntity.id,
      fileName: fileEntity.fileName,
      url: fileEntity.url ?? url,
      mimeType: fileEntity.mimeType,
      size: fileEntity.size,
      createdAt: fileEntity.createdAt,
    };
  }
}
