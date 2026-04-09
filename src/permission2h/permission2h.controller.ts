import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Query, Render, Req } from '@nestjs/common';
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

  @Get('list')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.MANAGER)
  @Render('permission-2h')
  async permission2h(@Req() req, @Query('page') page = 1, @Query('search') search = '', @Query('date') date = '') {
    const limit = 20;

    const { data, total, totalPages } =
      await this.permission2hService.paginatePermission2h(search, Number(page), limit, date, req.session.user);

    const currentPage = Number(page);
    const maxButtons = 7;

    console.log("DATA:", data);
    let title = 'Permission 2h';

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    return {
      totalPermissions: total,
      currentPage,
      totalPages,
      startPage,
      endPage,
      data,
      total,
      search,
      site: '',
      title: title,
      user: req.session.user
    }
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
