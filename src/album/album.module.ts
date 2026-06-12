import { Module } from '@nestjs/common';
import { SongModule } from '../song/song.module';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';

@Module({
  imports: [SongModule],
  controllers: [AlbumController],
  providers: [AlbumService],
})
export class AlbumModule {}
