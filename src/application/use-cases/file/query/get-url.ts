import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UseCase } from '../../../../core/use-case';
import type { FileRepository } from '../../../ports/file.repository';
import { FILE_REPOSITORY } from '../../../ports/tokens';
import { FileRetrieveFromS3UseCase } from '../retrieve-from-s3';

export interface FileGetUrlQueryInput {
  id: string;
  expire?: string;
}

export interface FileGetUrlQueryOutput {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class FileGetUrlQuery implements UseCase<
  FileGetUrlQueryInput,
  FileGetUrlQueryOutput
> {
  constructor(
    @Inject(FILE_REPOSITORY) private readonly fileRepository: FileRepository,
    private readonly fileRetrieveFromS3: FileRetrieveFromS3UseCase,
  ) {}

  async execute(input: FileGetUrlQueryInput): Promise<FileGetUrlQueryOutput> {
    const file = await this.fileRepository.findById(input.id);
    if (!file) {
      throw new NotFoundException('FILE_NOT_FOUND');
    }

    const { url } = await this.fileRetrieveFromS3.execute({
      bucketName: file.bucketName,
      filename: file.fileName,
      expire: input.expire ?? '7 days',
    });

    return {
      id: file.id,
      fileName: file.fileName,
      url,
      mimeType: file.mimeType,
      size: file.size,
    };
  }
}
