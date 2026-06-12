import { Injectable, NotFoundException } from '@nestjs/common';
import { AlbumUpsertDto } from './dto/album.dto';
import { PrismaService } from '../prisma/prisma.service';

interface AlbumRecord {
  id: bigint;
  artistId: bigint | null;
  title: string;
  coverImageUrl: string | null;
  releaseYear: number | null;
  description: string | null;
  isActive: boolean;
}

interface AlbumResponse {
  id: number;
  artistId: number | null;
  title: string;
  coverImageUrl: string | null;
  releaseYear: number | null;
  description: string | null;
  isActive: boolean;
}

@Injectable()
export class AlbumService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<AlbumResponse[]> {
    const albums = await this.prisma.album.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return albums.map((album) => this.serialize(album));
  }

  async create(dto: AlbumUpsertDto): Promise<AlbumResponse> {
    const artist = await this.prisma.artist.findFirst({ orderBy: { id: 'asc' } });
    if (!artist) {
      throw new NotFoundException('Artist not configured');
    }

    const album = await this.prisma.album.create({
      data: {
        artistId: artist.id,
        title: dto.title,
        coverImageUrl: dto.coverImageUrl,
        releaseYear: dto.releaseYear,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });

    return this.serialize(album);
  }

  async update(id: bigint, dto: AlbumUpsertDto): Promise<AlbumResponse> {
    await this.assertExists(id);

    const album = await this.prisma.album.update({
      where: { id },
      data: {
        title: dto.title,
        coverImageUrl: dto.coverImageUrl,
        releaseYear: dto.releaseYear,
        description: dto.description,
        isActive: dto.isActive ?? undefined,
      },
    });

    return this.serialize(album);
  }

  async remove(id: bigint): Promise<void> {
    await this.assertExists(id);
    await this.prisma.album.delete({ where: { id } });
  }

  private async assertExists(id: bigint): Promise<void> {
    const exists = await this.prisma.album.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException(`Album not found: ${id}`);
    }
  }

  private serialize(album: AlbumRecord): AlbumResponse {
    return {
      id: Number(album.id),
      artistId: album.artistId == null ? null : Number(album.artistId),
      title: album.title,
      coverImageUrl: album.coverImageUrl,
      releaseYear: album.releaseYear,
      description: album.description,
      isActive: album.isActive,
    };
  }
}
