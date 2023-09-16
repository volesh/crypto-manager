import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

import { envConfig } from '../configs/envConfig';
import { OAuthEnum } from '../enums/oauth.enum';
import { TokensI } from '../interfaces/tokens/tokens.interface';

@Injectable()
export class TokensHelper {
  constructor(private readonly jwtService: JwtService) {}

  // Generate Tokens !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async generateTokens(id: string): Promise<TokensI> {
    const accessToken = await this.jwtService.signAsync(
      { id },
      {
        secret: envConfig.access_key,
        expiresIn: '15m',
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { id },
      {
        secret: envConfig.refresh_key,
        expiresIn: '7d',
      },
    );
    return { accessToken, refreshToken };
  }

  // Validate OAuth token
  async validateOAuth(token: string, type: OAuthEnum): Promise<{ email: string; name: string }> {
    try {
      if (type === OAuthEnum.google) {
        const { data } = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

        return { email: data.email, name: data.name };
      }
    } catch {
      throw new UnauthorizedException();
    }
  }
}
