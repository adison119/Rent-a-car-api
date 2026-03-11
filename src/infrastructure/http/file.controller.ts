import {
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { User } from '../../domain/user';
import { FileUploadCommand } from '../../application/use-cases/file/command/upload';
import { FileGetUrlQuery } from '../../application/use-cases/file/query/get-url';
import { Public } from '../../common/decorators/public.decorator';
import { ParseCuidPipe } from '../../common/pipes/parse-cuid.pipe';

type RequestWithUser = { user?: User };

@ApiTags('file')
@ApiBearerAuth()
@Controller({ path: 'files', version: '1' })
export class FileController {
  constructor(
    private readonly fileUploadCommand: FileUploadCommand,
    private readonly fileGetUrlQuery: FileGetUrlQuery,
  ) {}

  @Public()
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'ไฟล์ที่ต้องการอัปโหลด',
        },
      },
      required: ['file'],
    },
  })
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /^(image\/.+|application\/pdf)$/,
            errorMessage: 'อนุญาตเฉพาะไฟล์รูปภาพหรือ PDF',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    return this.fileUploadCommand.execute({
      file,
      createdById: req.user?.id ?? null,
    });
  }

  @Public()
  @Get(':id/url')
  async getUrl(@Param('id', ParseCuidPipe) id: string) {
    return this.fileGetUrlQuery.execute({ id });
  }
}
