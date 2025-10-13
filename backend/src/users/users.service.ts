import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

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
      throw new BadRequestException('Użytkownik o takim loginie lub emailu już istnieje');
    }

    // wygeneruj hasło
    const generatedPassword = crypto.randomBytes(8).toString('hex');

    // utwórz nowego użytkownika — hasło zostanie automatycznie zahashowane przez @BeforeInsert()
    const newUser = this.usersRepo.create({
      login,
      email,
      password: generatedPassword,
    });

    await this.usersRepo.save(newUser);

    // wyślij maila z hasłem
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

  // 🔹 Logowanie użytkownika
  async login(login: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { login } });
    if (!user) throw new UnauthorizedException('Nieprawidłowy login lub hasło');

    const isValid = await user.comparePassword(password);
    if (!isValid) throw new UnauthorizedException('Nieprawidłowy login lub hasło');

    return {
      message: 'Zalogowano pomyślnie',
      user: { id: user.id, login: user.login, email: user.email, accountType: user.accountType },
    };
  }

  // 🔹 Standardowe operacje CRUD
  findAll() {
    return this.usersRepo.find();
  }

  findOne(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async remove(id: string) {
    await this.usersRepo.delete(id);
    return { deleted: true };
  }
}
