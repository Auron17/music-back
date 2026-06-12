import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SongService } from '../song/song.service';
import { AlbumService } from './album.service';
import { AlbumUpsertDto } from './dto/album.dto';

@Controller('api/v1')
export class AlbumController {
  constructor(
    private readonly albums: AlbumService,
    private readonly songs: SongService,
  ) {}

  @Public()
  @Get('albums')
  list() {
    return this.albums.list();
  }

  @Public()
  @Get('albums/:id/songs')
  songsByAlbum(@Param('id', ParseIntPipe) id: number) {
    return this.songs.listByAlbum(BigInt(id));
  }

  @Post('admin/albums')
  create(@Body() dto: AlbumUpsertDto) {
    return this.albums.create(dto);
  }

  @Put('admin/albums/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: AlbumUpsertDto) {
    return this.albums.update(BigInt(id), dto);
  }

  @Delete('admin/albums/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<null> {
    await this.albums.remove(BigInt(id));
    return null;
  }
}
