import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiConsumes } from '@nestjs/swagger';
import { diskStorage, FileFastifyInterceptor } from 'fastify-file-interceptor';
import { extname } from 'path';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Upload single file
  @ApiConsumes('multipart/form-data')
  @Post('single-file')
  @UseInterceptors(
    FileFastifyInterceptor('file', {
      storage: diskStorage({
        destination: './upload/single',
        filename: (req: Request, file: any, callback) => {
          const name = randomStringGenerator();
          const fileExtName = extname(file.originalname);
          callback(null, `${name}${fileExtName}`);
        },
      }),
      fileFilter: (req: Request, file: any, callback) => callback(null, true),
    })
  )
  single(@UploadedFile() file: any, @Body() body: any) {
    console.log({ ...body, file: file });
    return { ...body, file: file };
  }
}
