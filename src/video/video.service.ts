import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VideoUpsertDto } from './dto/video.dto';
import { extractYoutubeId, youtubeThumbnail } from './youtube.util';

interface VideoRecord {
  id: bigint;
  artistId: bigint | null;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string | null;
  viewCount: bigint;
  isActive: boolean;
  sortOrder: number;
  releaseYear: number | null;
}

interface VideoResponse {
  id: number;
  artistId: number | null;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string | null;
  viewCount: number;
  isActive: boolean;
  sortOrder: number;
  releaseYear: number | null;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable()
export class VideoService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page = 0, size = 20): Promise<PageResponse<VideoResponse>> {
    const take = Math.min(Math.max(size, 1), 100);
    const safePage = Math.max(page, 0);
    const skip = safePage * take;
    const [total, items] = await Promise.all([
      this.prisma.video.count({ where: { isActive: true } }),
      this.prisma.video.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
    ]);

    return {
      content: items.map((video) => this.serialize(video)),
      page: safePage,
      size: take,
      totalElements: total,
      totalPages: Math.ceil(total / take),
    };
  }

  async get(id: bigint): Promise<VideoResponse> {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) {
      throw new NotFoundException(`Video not found: ${id}`);
    }

    return this.serialize(video);
  }

  async incrementViewCount(id: bigint): Promise<void> {
    try {
      await this.prisma.video.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    } catch {
      throw new NotFoundException(`Video not found: ${id}`);
    }
  }

  async create(dto: VideoUpsertDto): Promise<VideoResponse> {
    const artist = await this.prisma.artist.findFirst({ orderBy: { id: 'asc' } });
    if (!artist) {
      throw new NotFoundException('Artist not configured');
    }

    const youtubeId = extractYoutubeId(dto.youtubeUrl);
    const video = await this.prisma.video.create({
      data: {
        artistId: artist.id,
        title: dto.title,
        youtubeUrl: dto.youtubeUrl,
        youtubeId,
        thumbnailUrl: youtubeThumbnail(youtubeId),
        releaseYear: dto.releaseYear,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    return this.serialize(video);
  }

  async update(id: bigint, dto: VideoUpsertDto): Promise<VideoResponse> {
    await this.assertExists(id);
    const youtubeId = extractYoutubeId(dto.youtubeUrl);

    const video = await this.prisma.video.update({
      where: { id },
      data: {
        title: dto.title,
        youtubeUrl: dto.youtubeUrl,
        youtubeId,
        thumbnailUrl: youtubeThumbnail(youtubeId),
        releaseYear: dto.releaseYear,
        sortOrder: dto.sortOrder ?? undefined,
        isActive: dto.isActive ?? undefined,
      },
    });

    return this.serialize(video);
  }

  async remove(id: bigint): Promise<void> {
    await this.assertExists(id);
    await this.prisma.video.delete({ where: { id } });
  }

  private async assertExists(id: bigint): Promise<void> {
    const exists = await this.prisma.video.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException(`Video not found: ${id}`);
    }
  }

  private serialize(video: VideoRecord): VideoResponse {
    return {
      id: Number(video.id),
      artistId: video.artistId == null ? null : Number(video.artistId),
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      youtubeId: video.youtubeId,
      thumbnailUrl: video.thumbnailUrl,
      viewCount: Number(video.viewCount),
      isActive: video.isActive,
      sortOrder: video.sortOrder,
      releaseYear: video.releaseYear,
    };
  }
}
