import { Body, Controller, Get, Put } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ArtistService } from './artist.service';
import { ArtistUpdateDto } from './dto/artist-update.dto';

@Controller('api/v1')
export class ArtistController {
  constructor(private readonly artist: ArtistService) {}

  @Public()
  @Get('artist')
  current() {
    return this.artist.current();
  }

  @Put('admin/artist')
  update(@Body() dto: ArtistUpdateDto) {
    return this.artist.update(dto);
  }
}
