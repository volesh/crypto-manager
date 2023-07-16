import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envConfig } from 'src/general/configs';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envConfig.refresh_key,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();

    if (!refreshToken) {
      return false;
    }
    try {
      await this.prisma.tokens.findFirstOrThrow({
        where: { refreshToken },
      });
    } catch {
      return false;
    }
    return { ...payload, token: refreshToken };
  }
}
