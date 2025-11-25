import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  Patch,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import cloudinary from '../cloudinary/cloudinary.provider';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // 🔹 Profil użytkownika
  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // 🔹 Rejestracja
  @Post('register')
  register(@Body() body: { login: string; email: string }) {
    return this.usersService.register(body.login, body.email);
  }

  // 🔹 Logowanie
  @Post('login')
  login(@Body() body: { login: string; password: string }) {
    return this.usersService.login(body.login, body.password);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // 🔹 Zmiana e-maila
  @UseGuards(AuthGuard)
  @Patch('change-email')
  async changeEmail(@Request() req, @Body('email') email: string) {
    return this.usersService.updateEmail(req.user.id, email);
  }

  // 🔹 Zmiana hasła
  @UseGuards(AuthGuard)
  @Patch('change-password')
  async changePassword(
    @Request() req,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(
      req.user.id,
      body.oldPassword,
      body.newPassword,
    );
  }

 // 🔹 Upload avatara do Cloudinary
@UseGuards(AuthGuard)
@Post('upload-avatar')
@UseInterceptors(FileInterceptor('file'))
async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req) {
  try {
    if (!file) {
      throw new BadRequestException('Brak pliku do przesłania');
    }

    const username = req.user.username || 'unknown_user';
    const userId = req.user.id;
    const uploadPath = `inzynierka/${username}/avatar`;

    // 🔥 Kluczowa zmiana — upload z bufora zamiast pliku
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: uploadPath,
          public_id: 'avatar',
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(file.buffer);
    });

    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException(`Użytkownik o id ${userId} nie istnieje`);

    user.avatarUrl = (uploadResult as any).secure_url;
    await this.usersService['usersRepo'].save(user);

    return {
      message: '✅ Avatar uploaded successfully',
      avatarUrl: (uploadResult as any).secure_url,
      cloudFolder: uploadPath,
    };
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    throw new BadRequestException(error.message || 'Upload failed');
  }
}
@Post("forgot-password")
async forgotPassword(@Body() body: { login: string; email: string }) {
  return this.usersService.forgotPassword(body.login, body.email);
}

}
