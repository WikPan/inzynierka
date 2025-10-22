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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { AuthGuard } from '../auth/auth.guard';

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
}
