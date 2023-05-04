import { JwtService } from '@nestjs/jwt';
import { TokensI } from '../interfaces/tokens/tokens.interface';
import { envConfig } from '../configs/envConfig';
import { Injectable } from '@nestjs/common';

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
}
