import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res, Req, Render } from '@nestjs/common';
import { SmiaOstieService } from './smia_ostie.service';
import { CreateSmiaOstieDto } from './dto/create-smia_ostie.dto';
import { UpdateSmiaOstieDto } from './dto/update-smia_ostie.dto';
import { Response } from 'express';
import { RolesGuard } from 'src/user/role.guard';
import { UserRole } from 'src/user/entities/user.entity';
import { Roles } from 'src/user/role.decorator';

@Controller('smia-ostie')
export class SmiaOstieController {
  constructor(private readonly smiaOstieService: SmiaOstieService) { }

  @Get('export')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HR_LEAD)
  async export(
    @Res() res: any,
    @Req() req,
    @Query('search') search: string = '',
    @Query('page') page: number = 1,
    @Query('startDate') startDate: string = new Date().toISOString().split('T')[0],
    @Query('endDate') endDate: string = new Date().toISOString().split('T')[0],
  ) {
    const data = await this.smiaOstieService.toExport(search, req.session.user, startDate, endDate);
    console.log('DATA:', data);

    await this.smiaOstieService.exportSmiaOstieToExcel(data, res, startDate, endDate);
  }

  @Get('list')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HR_LEAD, UserRole.MANAGER, UserRole.PAYROLL)
  @Render('medical-service')
  async getMedicalService(
    @Req() req,
    @Query('search') search: string = '',
    @Query('page') page: number = 1,
    @Query('startDate') startDate: string = new Date().toISOString().split('T')[0],
    @Query('endDate') endDate: string = new Date().toISOString().split('T')[0],
  ) {
    const limit = 20;
    const { data, total, totalPages } = await this.smiaOstieService.paginateMedicalService(
      search,
      Number(page),
      limit,
      req.session.user,
      startDate,
      endDate,
    );

    const currentPage = Number(page);
    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    return {
      title: 'Medical Service',
      data,
      search,
      startDate,
      endDate,
      total,
      totalPages,
      startPage,
      endPage,
      currentPage,
      user: req.session.user,
    };
  }

  @Get('add')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Render('add-medical-service')
  async getAddMedicalService(
    @Req() req,
  ) {
    return {
      title: 'Add Medical Service',
      user: req.session.user,
    };
  }

  @Post('add')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async add(@Res() res: any, @Body() createSmiaOstieDto: CreateSmiaOstieDto) {
    await this.smiaOstieService.create(createSmiaOstieDto);
    const message = "Employee consulation added successfully.";
    res.redirect('/smia-ostie/list?message=' + message);
  }

  @Post()
  create(@Body() createSmiaOstieDto: CreateSmiaOstieDto) {
    return this.smiaOstieService.create(createSmiaOstieDto);
  }

  @Get()
  findAll() {
    return this.smiaOstieService.findAll();
  }

  @Get('list/today')
  findByDateDoingToday() {
    return this.smiaOstieService.findByDateDoingToday();
  }

  @Post('list/by-date')
  findByDate(@Body() { date }: { date: string }) {
    return this.smiaOstieService.findByDate(new Date(date));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smiaOstieService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSmiaOstieDto: UpdateSmiaOstieDto) {
    return this.smiaOstieService.update(id, updateSmiaOstieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smiaOstieService.remove(id);
  }

  @Get('stats/week')
  getWeeklyStats(@Query('site') site: string) {
    return this.smiaOstieService.countByDayForCurrentWeek(site);
  }

}
