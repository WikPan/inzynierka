import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken'; // ✅ dodane

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  // 🔹 Rejestracja użytkownika
  async register(login: string, email: string) {
    const existing = await this.usersRepo.findOne({
      where: [{ login }, { email }],
    });
    if (existing) {
      throw new BadRequestException(
        'Użytkownik o takim loginie lub emailu już istnieje',
      );
    }

    const generatedPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = this.usersRepo.create({
      login,
      email,
      password: hashedPassword,
    });

    await this.usersRepo.save(newUser);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Twoje nowe konto',
      text: `Cześć ${login}!\nTwoje konto zostało utworzone.\nTwoje hasło: ${generatedPassword}`,
    });

    return { message: 'Rejestracja zakończona sukcesem. Sprawdź e-mail.' };
  }

  // 🔹 Logowanie użytkownika z generowaniem tokena JWT
  async login(login: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { login } });
    if (!user) throw new UnauthorizedException('Nieprawidłowy login lub hasło');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      throw new UnauthorizedException('Nieprawidłowy login lub hasło');

    // ✅ Tworzymy token JWT zawierający ID użytkownika
    const payload = { id: user.id, username: user.login };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'sekretnyklucz', {
      expiresIn: '1d',
    });

    // ✅ Zwracamy token i dane użytkownika
    return {
      access_token: token,
      message: 'Zalogowano pomyślnie',
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        accountType: user.accountType,
      },
    };
  }

  // 🔹 Pobierz użytkownika po ID
  async findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  // 🔹 Pobierz wszystkich użytkowników
  findAll() {
    return this.usersRepo.find();
  }

  // 🔹 Pobierz jednego użytkownika
  findOne(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  // 🔹 Usuń użytkownika
  async remove(id: string) {
    await this.usersRepo.delete(id);
    return { deleted: true };
  }

  // 🔹 Zmiana e-maila
  async updateEmail(userId: string, email: string) {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('Użytkownik nie znaleziony');
    user.email = email;
    return this.usersRepo.save(user);
  }

  // 🔹 Zmiana hasła
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('Użytkownik nie znaleziony');

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid)
      throw new BadRequestException('Stare hasło jest nieprawidłowe');

    user.password = await bcrypt.hash(newPassword, 10);
    return this.usersRepo.save(user);
  }
      // 🔹 Umożliwia tworzenie użytkownika bezpośrednio z AuthService
    async create(data: Partial<User>): Promise<User> {
      const user = this.usersRepo.create(data);
      return this.usersRepo.save(user);
    }

    // 🔹 Znajduje użytkownika po loginie (dla AuthService)
    async findByLogin(login: string): Promise<User | null> {
      return this.usersRepo.findOne({ where: { login } });
    }

}
