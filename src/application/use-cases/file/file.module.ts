import { Module } from '@nestjs/common';
import { FileUploadToS3UseCase } from './upload-to-s3';
import { FileRetrieveFromS3UseCase } from './retrieve-from-s3';
import { FileUploadCommand } from './command/upload';
import { FileGetUrlQuery } from './query/get-url';

@Module({
  providers: [
    FileUploadToS3UseCase,
    FileRetrieveFromS3UseCase,
    FileUploadCommand,
    FileGetUrlQuery,
  ],
  exports: [
    FileUploadToS3UseCase,
    FileRetrieveFromS3UseCase,
    FileUploadCommand,
    FileGetUrlQuery,
  ],
})
export class FileModule {}
