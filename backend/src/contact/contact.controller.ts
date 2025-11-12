import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Controller('contact')
export class ContactController {
  @Post()
  async sendMessage(
    @Body() body: { email: string; title: string; message: string },
  ) {
    const { email, title, message } = body;

    if (!email || !title || !message) {
      throw new BadRequestException('Wszystkie pola są wymagane.');
    }

    // Konfiguracja jak w UsersService
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail wysyłany do Ciebie (np. właściciela serwisu)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // wysyłamy na Twój adres
      subject: `📩 Nowa wiadomość z formularza kontaktowego: ${title}`,
      text: `
Otrzymałeś nową wiadomość z formularza kontaktowego Oofferto:

📧 Od: ${email}

📝 Temat: ${title}

💬 Treść:
${message}

Pozdrawiamy,
Zespół Oofferto
      `,
    });

    // Potwierdzenie dla użytkownika
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '📨 Dziękujemy za kontakt z Oofferto!',
      text: `Cześć!\nDziękujemy za Twoją wiadomość: "${title}". Odpowiemy na nią jak najszybciej.\n\nPozdrawiamy,\nZespół Oofferto`,
    });

    return { message: '✅ Wiadomość została wysłana pomyślnie!' };
  }
}
