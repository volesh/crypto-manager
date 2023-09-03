import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth2';
import { VerifiedCallback } from 'passport-jwt';

import { envConfig } from './../../../general/configs/envConfig';

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: envConfig.google_client_id,
      clientSecret: envConfig.google_client_secret,
      callbackURL: envConfig.google_callback_url,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback) {
    const { name, emails } = profile;
    console.log(accessToken);

    const user = {
      email: emails[0].value,
      name: name.givenName,
      accessToken,
    };
    done(null, user);
  }
}
