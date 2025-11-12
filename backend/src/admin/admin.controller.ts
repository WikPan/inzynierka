import {
  Controller,
  Get,
  UseGuards,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 📋 Wszyscy użytkownicy
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  // 📋 Wszystkie oferty
  @Get('offers')
  async getAllOffers() {
    return this.adminService.getAllOffers();
  }

  // 👥 Zgłoszeni użytkownicy
  @Get('reported-users')
  async getReportedUsers() {
    return this.adminService.getReportedUsers();
  }

  // 📦 Zgłoszone oferty
  @Get('reported-offers')
  async getReportedOffers() {
    return this.adminService.getReportedOffers();
  }

  // 🚫 Zablokuj użytkownika
  @Patch('users/:id/block')
  async blockUser(@Param('id') id: string, @Request() req) {
    return this.adminService.blockUser(id, req.user.id);
  }

  // 🔓 Odblokuj użytkownika
  @Patch('users/:id/unblock')
  async unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id);
  }

  // ❌ Usuń użytkownika
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req) {
    return this.adminService.deleteUser(id, req.user.id);
  }

  // 🚫 Zablokuj ofertę
  @Patch('offers/:id/block')
  async blockOffer(@Param('id') id: string, @Request() req) {
    return this.adminService.blockOffer(id, req.user.id);
  }

  // 🔓 Odblokuj ofertę
  @Patch('offers/:id/unblock')
  async unblockOffer(@Param('id') id: string, @Request() req) {
    return this.adminService.unblockOffer(id, req.user.id);
  }

  // ❌ Usuń ofertę
  @Delete('offers/:id')
  async deleteOffer(@Param('id') id: string, @Request() req) {
    return this.adminService.deleteOffer(id, req.user.id);
  }
}
