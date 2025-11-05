import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      console.warn('🚫 Brak nagłówka Authorization');
      throw new UnauthorizedException('Brak tokenu w nagłówku');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      console.warn('🚫 Zły format tokenu:', authHeader);
      throw new UnauthorizedException('Nieprawidłowy format tokenu (Bearer)');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET nie ustawiony w .env!');
      throw new UnauthorizedException('Brak konfiguracji JWT');
    }

    try {
      const decoded = jwt.verify(token, secret);
      request['user'] = decoded;
      return true;
    } catch (err: any) {
      console.error('❌ Błąd weryfikacji tokenu:', err.message);
      throw new UnauthorizedException('Token niepoprawny lub wygasł');
    }
  }
}
