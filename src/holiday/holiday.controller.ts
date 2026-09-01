import { Controller, Get, Post, Body, Patch, Param, Delete, Render, Req, Res, UseGuards, Query } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { RolesGuard } from '../user/role.guard';
import { Roles } from '../user/role.decorator';
import { UserRole } from '../user/entities/user.entity';
import { HistoryService } from '../history/history.service';
import { HistoryReason } from '../history/entities/history.entity';

@Controller('holiday')
export class HolidayController {
  constructor(
    private readonly holidayService: HolidayService,
    private readonly historyService: HistoryService
  ) { }

  @Get('by-date/:start_date/:end_date')
  async getByDate(@Param('start_date') start_date: string, @Param('end_date') end_date: string) {
    const date1 = new Date(start_date);
    const date2 = new Date(end_date);
    if (date1 > date2) {
      return [];
    }
    const holidays = await this.holidayService.findByDateRange(start_date, end_date);
    return holidays;
  }

  @Get('holidays')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.PRODUCTION_MANAGER, UserRole.HR_LEAD, UserRole.MANAGER, UserRole.ADMIN)
  @Render('holidays')
  async getHolidays(@Req() req, @Res() res, @Query('year') year: string) {
    var y;
    if (!year) {
      y = new Date().getFullYear();
    } else {
      y = new Date(year).getFullYear();
    }
    const holidays = await this.holidayService.findAllByYear(y);
    const thisyear = new Date().getFullYear() + 1;
    var length = thisyear - 2026 + 1;
    if (length > 11) {
      length = 11;
    }

    const years = Array.from({ length }, (_, i) => thisyear - i);
    return {
      title: "Holidays",
      holidays,
      user: req.session.user,
      years,
      currentYear: y
    }
  }

  @Post('edit-holiday/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL)
  async postEditHolidays(@Req() req, @Body() createHolidayDto: CreateHolidayDto, @Res() res, @Param('id') id: string) {
    const old_holiday = await this.holidayService.findOne(id);
    const holiday = await this.holidayService.update(id, createHolidayDto);
    const holiday_details = await this.holidayService.findOne(id);
    await this.historyService.create({
      reason: HistoryReason.HOLIDAY,
      message: "Holiday " + old_holiday?.name + " of " + old_holiday?.date + " updated to " + holiday_details?.name + " of " + holiday_details?.date + " by " + req.session.user.employee.matricule,
      created_by: req.session.user.employee.matricule,
    });

    if (holiday) {
      return res.redirect('/holiday/holidays?message=Holiday updated successfully!');
    }
    return res.redirect('/holiday/holidays?error=Failed to update holiday!');
  }

  @Get('delete-holiday/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL)
  @Render('confirm-delete-holiday')
  async getDeleteHolidays(@Req() req, @Res() res, @Param('id') id: string) {
    const holiday = await this.holidayService.findOne(id);
    return {
      title: "Delete holiday",
      holiday,
      user: req.session.user,
    }
  }

  @Post('delete-holiday/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL)
  async postDeleteHolidays(@Req() req, @Res() res, @Param('id') id: string) {
    const old_holiday = await this.holidayService.findOne(id);
    const holiday = await this.holidayService.remove(id);
    if (holiday) {
      await this.historyService.create({
        reason: HistoryReason.HOLIDAY,
        message: "Holiday " + old_holiday?.name + " of " + old_holiday?.date + " deleted by " + req.session.user.employee.matricule,
        created_by: req.session.user.employee.matricule,
      });
      return res.redirect('/holiday/holidays?message=Holiday deleted successfully!');
    }
    return res.redirect('/holiday/holidays?error=Failed to delete holiday!');
  }

  @Post('new-holiday')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL)
  async postNewHolidays(@Req() req, @Body() createHolidayDto: CreateHolidayDto, @Res() res) {
    const holiday = await this.holidayService.create(createHolidayDto);
    if (holiday) {
      await this.historyService.create({
        reason: HistoryReason.HOLIDAY,
        message: "Holiday " + createHolidayDto?.name + " of " + createHolidayDto?.date + " created by " + req.session.user.employee.matricule,
        created_by: req.session.user.employee.matricule,
      });
      return res.redirect('/holiday/holidays?message=Holiday created successfully!');
    }
    return res.redirect('/holiday/holidays?error=Failed to create holiday!');
  }

  @Get('edit-holiday/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL)
  @Render('edit-holiday')
  async getEditHolidays(@Req() req, @Res() res, @Param('id') id: string) {
    const holiday = await this.holidayService.findOne(id);
    const thisyear = new Date().getFullYear();
    var length = thisyear - 2026 + 1;
    if (length > 10) {
      length = 10;
    }

    return {
      title: "Edit holiday",
      holiday,
      user: req.session.user,
    }
  }

  @Get('new-holiday')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL)
  @Render('new-holiday')
  async getNewHolidays(@Req() req, @Res() res) {
    const thisyear = new Date().getFullYear();
    var length = thisyear - 2026 + 1;
    if (length > 10) {
      length = 10;
    }

    const years = Array.from({ length }, (_, i) => thisyear - i);
    return {
      title: "New holidays",
      user: req.session.user,
      years
    }
  }

  @Post()
  create(@Body() createHolidayDto: CreateHolidayDto) {
    return this.holidayService.create(createHolidayDto);
  }

  @Get()
  findAll() {
    return this.holidayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.holidayService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHolidayDto: UpdateHolidayDto) {
    return this.holidayService.update(id, updateHolidayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.holidayService.remove(id);
  }
}
