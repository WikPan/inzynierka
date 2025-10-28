import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // 🔹 Rejestracja (generuje losowe hasło i zapisuje do bazy)
  async register(login: string, email: string) {
    const password = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ login, email, password: hashed });

    return { message: 'User registered successfully', login, password };
  }

  // 🔹 Logowanie — zwraca token JWT
  async login(login: string, password: string) {
    const user = await this.usersService.findByLogin(login);
    if (!user) throw new UnauthorizedException('Nie znaleziono użytkownika');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Niepoprawne hasło');

    const payload = { id: user.id, username: user.login };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'sekretnyklucz',
      expiresIn: '1d',
    });

    return { access_token: token };
  }
}
