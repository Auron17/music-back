import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import {
  LikedSongsQueryDto,
  PaginationDto,
  SearchDto,
  SongLikeDto,
  SongOrderDto,
  SongUpsertDto,
} from './dto/song.dto';
import { SongService } from './song.service';

@Controller('api/v1')
export class SongController {
  constructor(private readonly songs: SongService) {}

  @Public()
  @Get('songs')
  list(@Query() query: PaginationDto) {
    return this.songs.list(query.page, query.size);
  }

  @Public()
  @Get('songs/featured')
  featured() {
    return this.songs.featured();
  }

  @Public()
  @Get('songs/search')
  search(@Query() query: SearchDto) {
    return this.songs.search(query.q, query.page, query.size);
  }

  @Public()
  @Get('songs/liked')
  liked(@Query() query: LikedSongsQueryDto) {
    return this.songs.likedByDevice(query.deviceId, query.page, query.size);
  }

  @Public()
  @Get('songs/:id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.songs.get(BigInt(id));
  }

  @Public()
  @Post('songs/:id/play')
  async play(@Param('id', ParseIntPipe) id: number): Promise<null> {
    await this.songs.incrementPlayCount(BigInt(id));
    return null;
  }

  @Public()
  @Post('songs/:id/like')
  like(@Param('id', ParseIntPipe) id: number, @Body() dto: SongLikeDto) {
    return this.songs.like(BigInt(id), dto.deviceId);
  }

  @Public()
  @Delete('songs/:id/like')
  unlike(@Param('id', ParseIntPipe) id: number, @Query() query: SongLikeDto) {
    return this.songs.unlike(BigInt(id), query.deviceId);
  }

  @Post('admin/songs')
  create(@Body() dto: SongUpsertDto) {
    return this.songs.create(dto);
  }

  @Put('admin/songs/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: SongUpsertDto) {
    return this.songs.update(BigInt(id), dto);
  }

  @Delete('admin/songs/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<null> {
    await this.songs.remove(BigInt(id));
    return null;
  }

  @Put('admin/songs/:id/order')
  updateOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: SongOrderDto) {
    return this.songs.updateOrder(BigInt(id), dto.sortOrder);
  }
}
