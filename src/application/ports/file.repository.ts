/**
 * Application port: file metadata persistence (S3 object key + metadata).
 * Implemented by Prisma in infrastructure/persistence/prisma.
 */
export interface FileEntity {
  id: string;
  bucketName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string | null;
  createdById: string | null;
  createdAt: Date;
}

export interface CreateFileInput {
  bucketName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url?: string | null;
  createdById?: string | null;
}

export interface FileRepository {
  create(input: CreateFileInput): Promise<FileEntity>;
  findById(id: string): Promise<FileEntity | null>;
}
