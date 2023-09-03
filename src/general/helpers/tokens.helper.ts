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
  async validateOAuth(token: string, type: OAuthEnum): Promise<string> {
    console.log(token);
    console.log(type);

    try {
      if (type === OAuthEnum.google) {
        const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/tokeninfo', {
          params: { access_token: token },
        });
        console.log(data);

        return data.email;
      }
    } catch {
      throw new UnauthorizedException();
    }
  }
}
