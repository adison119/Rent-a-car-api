import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

/** CUID format (e.g. Prisma default): starts with c, 25 chars alphanumeric */
const CUID_REGEX = /^c[a-z0-9]{24}$/;

@Injectable()
export class ParseCuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('รหัสไม่ถูกต้อง');
    }
    const trimmed = value.trim();
    if (!CUID_REGEX.test(trimmed)) {
      throw new BadRequestException('รหัสไม่ถูกต้อง');
    }
    return trimmed;
  }
}
