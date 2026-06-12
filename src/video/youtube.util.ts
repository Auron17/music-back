import { BadRequestException } from '@nestjs/common';

const YOUTUBE_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;

export function extractYoutubeId(url: string): string {
  if (!url) {
    throw new BadRequestException('YouTube URL is required');
  }

  const match = YOUTUBE_PATTERN.exec(url);
  if (!match) {
    throw new BadRequestException(`Invalid YouTube URL: ${url}`);
  }

  return match[1];
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
