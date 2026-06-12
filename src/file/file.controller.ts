import { BadRequestException, Controller, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';
import { FileService } from './file.service';

type FastifyMultipartRequest = FastifyRequest & {
  file: () => Promise<MultipartFile | undefined>;
};

@Controller('api/v1/files')
export class FileController {
  constructor(private readonly files: FileService) {}

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('upload/audio')
  async uploadAudio(@Req() req: FastifyMultipartRequest) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.files.saveAudio(file);
  }

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Post('upload/image')
  async uploadImage(@Req() req: FastifyMultipartRequest) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.files.saveImage(file);
  }
}
