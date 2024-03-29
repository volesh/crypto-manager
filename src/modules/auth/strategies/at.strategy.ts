import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { envConfig } from '../../../general/configs';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envConfig.access_key,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const accessToken = req.get('Authorization').replace('Bearer', '').trim();
    if (!accessToken) {
      return false;
    }
    try {
      await this.prisma.tokens.findFirstOrThrow({
        where: { accessToken },
      });
    } catch {
      return false;
    }
    return { ...payload, token: accessToken };
  }
}
