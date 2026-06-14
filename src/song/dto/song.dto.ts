import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SongUpsertDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsInt()
  albumId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @IsString()
  @IsNotEmpty()
  audioUrl!: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  releaseYear?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SongOrderDto {
  @IsInt()
  sortOrder!: number;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number = 20;
}

export class SearchDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  q!: string;
}

export class SongLikeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deviceId!: string;
}

export class LikedSongsQueryDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deviceId!: string;
}
