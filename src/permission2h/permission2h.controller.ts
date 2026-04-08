import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Query } from '@nestjs/common';
import { Permission2hService } from './permission2h.service';
import { CreatePermission2hDto } from './dto/create-permission2h.dto';
import { UpdatePermission2hDto } from './dto/update-permission2h.dto';
import type { Response } from 'express';
import { Roles } from 'src/user/role.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { RolesGuard } from 'src/user/role.guard';

@Controller('permission2h')
export class Permission2hController {
  constructor(private readonly permission2hService: Permission2hService) { }

  @Get('export')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.MANAGER)
  async export(
    @Res() res: Response,
    @Query('date') date: string,
    @Query('site') site: string,
  ) {
    const data = await this.permission2hService.getPermission2h(date, site);
    console.log('DATA:', data);

    await this.permission2hService.exportPermission2hToExcel(data, res, date);
  }

  @Post()
  create(@Body() createPermission2hDto: CreatePermission2hDto) {
    return this.permission2hService.create(createPermission2hDto);
  }

  @Get()
  findAll() {
    return this.permission2hService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permission2hService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermission2hDto: UpdatePermission2hDto) {
    return this.permission2hService.update(id, updatePermission2hDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permission2hService.remove(id);
  }

}
