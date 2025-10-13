import { Controller, Get, Post, Param, Delete, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll(): Promise<User[]> {
    return this.usersService.findAll();
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
}
