import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Query, Render, Req } from '@nestjs/common';
import { Permission2hService } from './permission2h.service';
import { CreatePermission2hDto } from './dto/create-permission2h.dto';
import { UpdatePermission2hDto } from './dto/update-permission2h.dto';
import type { Response } from 'express';
import { Roles } from 'src/user/role.decorator';
import { Site, UserRole } from 'src/user/entities/user.entity';
import { RolesGuard } from 'src/user/role.guard';
import { HistoryReason } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';

@Controller('permission2h')
export class Permission2hController {
  constructor(private readonly permission2hService: Permission2hService, private readonly historyService: HistoryService) { }

  @Get('approuve-permission-2h')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
  @Render('approuve-permission-2h')
  async approuveLeaves(@Req() req: any, @Query() error?: string) {
    const permissions = await this.permission2hService.getNonApprouvedLeaves(req.session.user.id);
    return { title: "Approuve Permission 2h", error: error ? error : null, permissions: permissions };
  }

  @Post('approve-permission-2h/:permissionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
  async approveLeave(@Param('permissionId') permissionId: string, @Res() res: Response, @Req() req: any) {
    const permission = await this.permission2hService.findOne(permissionId);
    if (!permission) {
      return res.redirect('/permission2h/approuve-permission-2h');
    }
    await this.permission2hService.approveLeave(permissionId, req.session.user.id);
    await this.historyService.create({
      reason: HistoryReason.PERMISSION_2H,
      message: "Permission 2h " + permission.date + " of " + permission.employee.name + " " + permission.employee.firstname + " approved by " + req.session.user.firstName + " " + req.session.user.name,
      created_by: req.session.user.matricule,
    });
    res.redirect('/permission2h/approuve-permission-2h');
  }

  @Post('reject-permission-2h/:permissionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
  async rejectLeave(@Param('permissionId') permissionId: string, @Res() res: Response, @Req() req: any) {
    const permission = await this.permission2hService.findOne(permissionId);
    if (!permission) {
      return res.redirect('/permission2h/approuve-permission-2h');
    }
    await this.permission2hService.rejectLeave(permissionId, req.session.user.id);
    await this.historyService.create({
      reason: HistoryReason.PERMISSION_2H,
      message: "Permission 2h " + permission.date + " of " + permission.employee.name + " " + permission.employee.firstname + " rejected by " + req.session.user.firstName + " " + req.session.user.name,
      created_by: req.session.user.matricule,
    });
    res.redirect('/permission2h/approuve-permission-2h');
  }

  @Get('export')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.MANAGER, UserRole.HR_LEAD)
  async export(
    @Res() res: Response,
    @Req() req,
    @Query('search') search = '',
    @Query('startDate') startDate = new Date().toISOString().split('T')[0],
    @Query('endDate') endDate = new Date().toISOString().split('T')[0],
    @Query('site') site = '',
  ) {
    const data = await this.permission2hService.getToExport(
      search,
      startDate,
      endDate,
      site,
      req.session.user,
    );

    // create a simple date range string (ex: "01/01/2024-10/01/2024")
    const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleDateString('en-GB');

    const dateRange = `${formatDate(startDate)}-${formatDate(endDate)}`;
    const { data: toExport, total: toExportTotal } = await this.permission2hService.getToExport(
      search,
      startDate,
      endDate,
      site,
      req.session.user,
    );

    await this.permission2hService.exportPermission2hToExcel(toExport, res, dateRange);
  }

  @Get('list')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.MANAGER, UserRole.HR_LEAD)
  @Render('permission-2h')
  async permission2h(
    @Req() req,
    @Query('page') page = 1,
    @Query('search') search = '',
    @Query('startDate') startDate = new Date().toISOString().split('T')[0],
    @Query('endDate') endDate = new Date().toISOString().split('T')[0],
    @Query('site') site = '',
  ) {
    const limit = 20;
    const { data, total, totalPages } =
      await this.permission2hService.paginatePermission2h(
        search,
        Number(page),
        limit,
        startDate,
        endDate,
        site,
        req.session.user,
      );

    const currentPage = Number(page);
    const maxButtons = 7;

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    const allowedSites = this.getAllowedSites(req.session.user.site);
    const KEYS = allowedSites.map(val => {
      // On cherche la clé dans l'objet Site qui possède cette valeur
      const key = (Object.keys(Site) as (keyof typeof Site)[]).find(
        k => Site[k] === val
      );
      return key;
    });

    return {
      totalPermissions: total,
      currentPage,
      totalPages,
      startPage,
      endPage,
      data,
      total,
      search,
      startDate,
      endDate,
      allowedSites,
      KEYS,
      site,
      title: 'Permission 2h',
      user: req.session.user,
    };
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

  private getAllowedSites(userSite: string): string[] {

    if (userSite === Site.MADA) {
      return [Site.ABE1, Site.ABE2, Site.TANA]; // pas de filtre
    }

    if (userSite === Site.ANTSIRABE) {
      return [Site.ABE1, Site.ABE2];
    }

    return [userSite];
  }
}
