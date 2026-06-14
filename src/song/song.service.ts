import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SongUpsertDto } from './dto/song.dto';

interface SongRecord {
  id: bigint;
  artistId: bigint | null;
  albumId: bigint | null;
  title: string;
  durationSeconds: number | null;
  audioUrl: string;
  coverImageUrl: string | null;
  releaseYear: number | null;
  playCount: bigint;
  isActive: boolean;
  sortOrder: number;
}

interface SongResponse {
  id: number;
  artistId: number | null;
  albumId: number | null;
  title: string;
  durationSeconds: number | null;
  audioUrl: string;
  coverImageUrl: string | null;
  releaseYear: number | null;
  playCount: number;
  isActive: boolean;
  sortOrder: number;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface SongLikeResponse {
  songId: number;
  deviceId: string;
  liked: boolean;
}

@Injectable()
export class SongService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page = 0, size = 20): Promise<PageResponse<SongResponse>> {
    return this.page({ isActive: true }, page, size);
  }

  async listByAlbum(albumId: bigint): Promise<SongResponse[]> {
    const items = await this.prisma.song.findMany({
      where: { albumId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return items.map((song) => this.serialize(song));
  }

  async featured(): Promise<SongResponse[]> {
    const items = await this.prisma.song.findMany({
      where: { isActive: true },
      orderBy: { playCount: 'desc' },
      take: 5,
    });

    return items.map((song) => this.serialize(song));
  }

  async get(id: bigint): Promise<SongResponse> {
    const song = await this.prisma.song.findUnique({ where: { id } });
    if (!song) {
      throw new NotFoundException(`Song not found: ${id}`);
    }

    return this.serialize(song);
  }

  async incrementPlayCount(id: bigint): Promise<void> {
    try {
      await this.prisma.song.update({
        where: { id },
        data: { playCount: { increment: 1 } },
      });
    } catch {
      throw new NotFoundException(`Song not found: ${id}`);
    }
  }

  async search(q: string, page = 0, size = 20): Promise<PageResponse<SongResponse>> {
    return this.page(
      { isActive: true, title: { contains: q, mode: 'insensitive' } },
      page,
      size,
    );
  }

  async likedByDevice(
    deviceId: string,
    page = 0,
    size = 20,
  ): Promise<PageResponse<SongResponse>> {
    const take = Math.min(Math.max(size, 1), 100);
    const safePage = Math.max(page, 0);
    const skip = safePage * take;
    const where: Prisma.SongLikeWhereInput = { deviceId, song: { isActive: true } };
    const [total, likes] = await Promise.all([
      this.prisma.songLike.count({ where }),
      this.prisma.songLike.findMany({
        where,
        include: { song: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      content: likes.map((like) => this.serialize(like.song)),
      page: safePage,
      size: take,
      totalElements: total,
      totalPages: Math.ceil(total / take),
    };
  }

  async like(id: bigint, deviceId: string): Promise<SongLikeResponse> {
    await this.assertActiveSongExists(id);
    await this.prisma.songLike.upsert({
      where: { deviceId_songId: { deviceId, songId: id } },
      update: {},
      create: { deviceId, songId: id },
    });

    return { songId: Number(id), deviceId, liked: true };
  }

  async unlike(id: bigint, deviceId: string): Promise<SongLikeResponse> {
    await this.prisma.songLike.deleteMany({ where: { songId: id, deviceId } });
    return { songId: Number(id), deviceId, liked: false };
  }

  async create(dto: SongUpsertDto): Promise<SongResponse> {
    const artist = await this.prisma.artist.findFirst({ orderBy: { id: 'asc' } });
    if (!artist) {
      throw new NotFoundException('Artist not configured');
    }

    const albumId = await this.resolveAlbumId(dto.albumId);
    const song = await this.prisma.song.create({
      data: {
        artistId: artist.id,
        albumId,
        title: dto.title,
        durationSeconds: dto.durationSeconds,
        audioUrl: dto.audioUrl,
        coverImageUrl: dto.coverImageUrl,
        releaseYear: dto.releaseYear,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    return this.serialize(song);
  }

  async update(id: bigint, dto: SongUpsertDto): Promise<SongResponse> {
    await this.assertExists(id);
    const albumId =
      dto.albumId === undefined ? undefined : await this.resolveAlbumId(dto.albumId);

    const song = await this.prisma.song.update({
      where: { id },
      data: {
        title: dto.title,
        albumId,
        durationSeconds: dto.durationSeconds,
        audioUrl: dto.audioUrl,
        coverImageUrl: dto.coverImageUrl,
        releaseYear: dto.releaseYear,
        sortOrder: dto.sortOrder ?? undefined,
        isActive: dto.isActive ?? undefined,
      },
    });

    return this.serialize(song);
  }

  async remove(id: bigint): Promise<void> {
    await this.assertExists(id);
    await this.prisma.song.delete({ where: { id } });
  }

  async updateOrder(id: bigint, sortOrder: number): Promise<SongResponse> {
    await this.assertExists(id);
    const song = await this.prisma.song.update({ where: { id }, data: { sortOrder } });
    return this.serialize(song);
  }

  private async resolveAlbumId(albumId: number | null | undefined): Promise<bigint | null> {
    if (albumId == null) {
      return null;
    }

    const id = BigInt(albumId);
    const exists = await this.prisma.album.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException(`Album not found: ${albumId}`);
    }

    return id;
  }

  private async assertExists(id: bigint): Promise<void> {
    const exists = await this.prisma.song.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException(`Song not found: ${id}`);
    }
  }

  private async assertActiveSongExists(id: bigint): Promise<void> {
    const exists = await this.prisma.song.findFirst({
      where: { id, isActive: true },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Song not found: ${id}`);
    }
  }

  private async page(
    where: Prisma.SongWhereInput,
    page: number,
    size: number,
  ): Promise<PageResponse<SongResponse>> {
    const take = Math.min(Math.max(size, 1), 100);
    const safePage = Math.max(page, 0);
    const skip = safePage * take;
    const [total, items] = await Promise.all([
      this.prisma.song.count({ where }),
      this.prisma.song.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
    ]);

    return {
      content: items.map((song) => this.serialize(song)),
      page: safePage,
      size: take,
      totalElements: total,
      totalPages: Math.ceil(total / take),
    };
  }

  private serialize(song: SongRecord): SongResponse {
    return {
      id: Number(song.id),
      artistId: song.artistId == null ? null : Number(song.artistId),
      albumId: song.albumId == null ? null : Number(song.albumId),
      title: song.title,
      durationSeconds: song.durationSeconds,
      audioUrl: song.audioUrl,
      coverImageUrl: song.coverImageUrl,
      releaseYear: song.releaseYear,
      playCount: Number(song.playCount),
      isActive: song.isActive,
      sortOrder: song.sortOrder,
    };
  }
}
