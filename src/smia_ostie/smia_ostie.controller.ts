import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res } from '@nestjs/common';
import { SmiaOstieService } from './smia_ostie.service';
import { CreateSmiaOstieDto } from './dto/create-smia_ostie.dto';
import { UpdateSmiaOstieDto } from './dto/update-smia_ostie.dto';
import { Response } from 'express';

@Controller('smia-ostie')
export class SmiaOstieController {
  constructor(private readonly smiaOstieService: SmiaOstieService) { }

  // @Get('export')
  // @UseGuards(SessionAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.HR_ADMIN, UserRole.PAYROLL_OFFICER)
  // async export(
  //   @Res() res: Response,
  //   @Query('date') date: string,
  //   @Query('site') site: string,
  // ) {
  //   const data = await this.smiaOstieService.getSmiaOstie(date, site);
  //   console.log('DATA:', data);

  //   await this.smiaOstieService.exportSmiaOstieToExcel(data, res, date);
  // }

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
    return this.smiaOstieService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSmiaOstieDto: UpdateSmiaOstieDto) {
    return this.smiaOstieService.update(+id, updateSmiaOstieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smiaOstieService.remove(+id);
  }

  @Get('stats/week')
  getWeeklyStats(@Query('site') site: string) {
    return this.smiaOstieService.countByDayForCurrentWeek(site);
  }

}
