import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  id: number;
  email: string;
  rolId: number;
  name: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
  const secret = configService.get<string>('JWT_SECRET');

  if (!secret) throw new Error('La variable de entorno JWT_SECRET no está definida.');

  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.id, email: payload.email, rolId: payload.rolId, name: payload.name };
  }
}
