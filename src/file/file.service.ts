import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MultipartFile } from '@fastify/multipart';
import { randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { mkdir, unlink } from 'fs/promises';
import { extname, join } from 'path';
import { pipeline } from 'stream/promises';

const AUDIO_EXTS = new Set(['.mp3']);
const AUDIO_MIMES = new Set(['audio/mpeg', 'audio/mp3']);
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png']);
const IMAGE_MIMES = new Set(['image/jpeg', 'image/png']);
const MAX_AUDIO = 50 * 1024 * 1024;
const MAX_IMAGE = 5 * 1024 * 1024;

@Injectable()
export class FileService {
  constructor(private readonly config: ConfigService) {}

  saveAudio(file: MultipartFile): Promise<{ fileUrl: string }> {
    return this.save(file, 'audio', AUDIO_EXTS, AUDIO_MIMES, MAX_AUDIO);
  }

  saveImage(file: MultipartFile): Promise<{ fileUrl: string }> {
    return this.save(file, 'images', IMAGE_EXTS, IMAGE_MIMES, MAX_IMAGE);
  }

  private async save(
    file: MultipartFile,
    subdir: string,
    extensions: Set<string>,
    mimeTypes: Set<string>,
    maxBytes: number,
  ): Promise<{ fileUrl: string }> {
    if (!file?.filename) {
      throw new BadRequestException('File is required');
    }

    let extension = extname(file.filename).toLowerCase();
    if (extension === '.jpeg') {
      extension = '.jpg';
    }

    if (!extensions.has(extension)) {
      throw new BadRequestException(`Unsupported extension: ${extension}`);
    }

    if (file.mimetype && !mimeTypes.has(file.mimetype)) {
      throw new BadRequestException(`Unsupported content type: ${file.mimetype}`);
    }

    const uploadDir = this.config.get<string>('UPLOAD_DIR') ?? './uploads';
    const dir = join(process.cwd(), uploadDir, subdir);
    await mkdir(dir, { recursive: true });

    const filename = `${randomUUID()}${extension}`;
    const target = join(dir, filename);
    const writeStream = createWriteStream(target);
    let bytes = 0;

    file.file.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        file.file.destroy(new Error('File too large'));
        writeStream.destroy(new Error('File too large'));
      }
    });

    try {
      await pipeline(file.file, writeStream);
    } catch {
      await unlink(target).catch(() => undefined);
      throw new BadRequestException('File too large or upload failed');
    }

    return { fileUrl: `/files/${subdir}/${filename}` };
  }
}
