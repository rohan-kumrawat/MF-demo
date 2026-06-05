import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is required but not set');
    }
    super({
      jwtFromRequest   : ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration : false,
      secretOrKey      : secret,
    });
  }

  async validate(payload: any) {
    // Returned value is attached to req.user
    return {
      sub           : payload.sub,
      centreId      : payload.centreId,
      role          : payload.role,
      diaryAccountId: payload.diaryAccountId ?? null,
      loanIds       : payload.loanIds ?? [],
    };
  }
}
