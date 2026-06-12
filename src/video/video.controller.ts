import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PaginationDto } from '../song/dto/song.dto';
import { VideoUpsertDto } from './dto/video.dto';
import { VideoService } from './video.service';

@Controller('api/v1')
export class VideoController {
  constructor(private readonly videos: VideoService) {}

  @Public()
  @Get('videos')
  list(@Query() query: PaginationDto) {
    return this.videos.list(query.page, query.size);
  }

  @Public()
  @Get('videos/:id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.videos.get(BigInt(id));
  }

  @Public()
  @Post('videos/:id/view')
  async view(@Param('id', ParseIntPipe) id: number): Promise<null> {
    await this.videos.incrementViewCount(BigInt(id));
    return null;
  }

  @Post('admin/videos')
  create(@Body() dto: VideoUpsertDto) {
    return this.videos.create(dto);
  }

  @Put('admin/videos/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: VideoUpsertDto) {
    return this.videos.update(BigInt(id), dto);
  }

  @Delete('admin/videos/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<null> {
    await this.videos.remove(BigInt(id));
    return null;
  }
}
