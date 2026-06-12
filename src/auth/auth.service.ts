import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{ token: string; expiresIn: string }> {
    const user = await this.prisma.adminUser.findUnique({ where: { username: dto.username } });
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '24h';
    const signOptions: JwtSignOptions = { expiresIn: expiresIn as JwtSignOptions['expiresIn'] };
    const token = await this.jwt.signAsync(
      { sub: String(user.id), username: user.username },
      signOptions,
    );

    return { token, expiresIn };
  }
}
