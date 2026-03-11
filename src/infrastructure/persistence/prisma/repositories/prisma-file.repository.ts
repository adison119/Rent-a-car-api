import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type {
  FileRepository as IFileRepository,
  FileEntity,
  CreateFileInput,
} from '../../../../application/ports/file.repository';

function toEntity(raw: {
  id: string;
  bucketName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string | null;
  createdById: string | null;
  createdAt: Date;
}): FileEntity {
  return {
    id: raw.id,
    bucketName: raw.bucketName,
    fileName: raw.fileName,
    mimeType: raw.mimeType,
    size: raw.size,
    url: raw.url,
    createdById: raw.createdById,
    createdAt: raw.createdAt,
  };
}

@Injectable()
export class PrismaFileRepository implements IFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateFileInput): Promise<FileEntity> {
    const row = await this.prisma.file.create({
      data: {
        bucketName: input.bucketName,
        fileName: input.fileName,
        mimeType: input.mimeType,
        size: input.size,
        url: input.url ?? undefined,
        createdById: input.createdById ?? undefined,
      },
    });
    return toEntity(row);
  }

  async findById(id: string): Promise<FileEntity | null> {
    const row = await this.prisma.file.findUnique({
      where: { id },
    });
    return row ? toEntity(row) : null;
  }
}
