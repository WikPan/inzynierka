// src/admin/admin.controller.ts
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

  // 👥 Lista użytkowników z raportami
  @Get('reported-users')
  async getReportedUsers() {
    return this.adminService.getReportedUsers();
  }

  // 📦 Lista ofert z raportami
  @Get('reported-offers')
  async getReportedOffers() {
    return this.adminService.getReportedOffers();
  }

  // 🚫 Zablokuj użytkownika
  @Patch('users/:id/block')
  async blockUser(@Param('id') id: string, @Request() req) {
    const adminId = req.user.id; // 👈 z tokena JWT
    return this.adminService.blockUser(id, adminId);
  }

  // ❌ Usuń użytkownika
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req) {
    const adminId = req.user.id;
    return this.adminService.deleteUser(id, adminId);
  }

  // 🚫 Zablokuj ofertę
  @Patch('offers/:id/block')
  async blockOffer(@Param('id') id: string, @Request() req) {
    const adminId = req.user.id;
    return this.adminService.blockOffer(id, adminId);
  }

  // ❌ Usuń ofertę
  @Delete('offers/:id')
  async deleteOffer(@Param('id') id: string, @Request() req) {
    const adminId = req.user.id;
    return this.adminService.deleteOffer(id, adminId);
  }
}
