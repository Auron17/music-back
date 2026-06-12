import { Injectable, NotFoundException } from '@nestjs/common';
import { ArtistUpdateDto } from './dto/artist-update.dto';
import { PrismaService } from '../prisma/prisma.service';

interface ArtistRecord {
  id: bigint;
  name: string;
  bio: string | null;
  profileImageUrl: string | null;
  backgroundImageUrl: string | null;
  instagramUrl: string | null;
  telegramUrl: string | null;
  youtubeUrl: string | null;
}

interface ArtistResponse {
  id: number;
  name: string;
  bio: string | null;
  profileImageUrl: string | null;
  backgroundImageUrl: string | null;
  instagramUrl: string | null;
  telegramUrl: string | null;
  youtubeUrl: string | null;
}

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  async current(): Promise<ArtistResponse> {
    const artist = await this.prisma.artist.findFirst({ orderBy: { id: 'asc' } });
    if (!artist) {
      throw new NotFoundException('Artist not configured');
    }

    return this.serialize(artist);
  }

  async update(dto: ArtistUpdateDto): Promise<ArtistResponse> {
    const artist = await this.prisma.artist.findFirst({ orderBy: { id: 'asc' } });
    if (!artist) {
      throw new NotFoundException('Artist not configured');
    }

    const updated = await this.prisma.artist.update({ where: { id: artist.id }, data: dto });
    return this.serialize(updated);
  }

  private serialize(artist: ArtistRecord): ArtistResponse {
    return {
      id: Number(artist.id),
      name: artist.name,
      bio: artist.bio,
      profileImageUrl: artist.profileImageUrl,
      backgroundImageUrl: artist.backgroundImageUrl,
      instagramUrl: artist.instagramUrl,
      telegramUrl: artist.telegramUrl,
      youtubeUrl: artist.youtubeUrl,
    };
  }
}
