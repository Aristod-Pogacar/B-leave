import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Render, Req, Query, Res } from '@nestjs/common';
import { EmployeeHistoryService } from './employee-history.service';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { UpdateEmployeeHistoryDto } from './dto/update-employee-history.dto';
import { RolesGuard } from 'src/user/role.guard';
import { Roles } from 'src/user/role.decorator';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('employee-history')
export class EmployeeHistoryController {
  constructor(private readonly employeeHistoryService: EmployeeHistoryService) { }

  @Get('get-employee-history/:employeeId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HR_LEAD, UserRole.MANAGER, UserRole.PAYROLL, UserRole.HR_LEAD)
  @Render('history')
  async getEmployeeHistory(@Req() req, @Param('employeeId') employeeId: string, @Res() res) {
    const data = await this.employeeHistoryService.employeeHistory(employeeId);
    return {
      title: "History | " + data[0].employee.name + " " + data[0].employee.firstname,
      data,
      user: req.session.user
    }
  }

  @Get('rehire/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HR_LEAD, UserRole.MANAGER, UserRole.PAYROLL, UserRole.HR_LEAD)
  @Render('rehire')
  async getrehire(@Req() req, @Param('id') id: string, @Res() res) {
    const data = await this.employeeHistoryService.findOne(id);
    return {
      title: "Rehire",
      data,
      user: req.session.user
    }
  }

  @Post('rehire/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HR_LEAD, UserRole.MANAGER, UserRole.PAYROLL, UserRole.HR_LEAD)
  async rehire(@Req() req, @Param('id') id: string, @Res() res, @Body() body: any) {
    const data = await this.employeeHistoryService.rehire(id, body);
    // if (data == `Employee not found`) {
    //   req.session.messages.push({ type: 'error', text: 'Employee not found' });
    // } else {
    //   req.session.messages.push({ type: 'success', text: 'Employee re-hired successfully' });
    // }
    return res.redirect('/employee-history/archives');
  }

  @Get('archives')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HR_LEAD, UserRole.MANAGER, UserRole.PAYROLL, UserRole.HR_LEAD)
  @Render('archive')
  async archives(
    @Req() req,
    @Query('search') search: string = '',
    @Query('page') page: number = 1,
  ) {
    const limit = 20;
    const { data, total, totalPages } = await this.employeeHistoryService.paginateArchives(
      search,
      Number(page),
      limit,
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

    return {
      title: "Archives",
      data,
      search,
      startPage,
      endPage,
      totalPages,
      total,
      currentPage,
      user: req.session.user
    };
  }

  @Post()
  create(@Body() createEmployeeHistoryDto: CreateEmployeeHistoryDto) {
    return this.employeeHistoryService.create(createEmployeeHistoryDto);
  }

  @Get()
  findAll() {
    return this.employeeHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeHistoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeHistoryDto: UpdateEmployeeHistoryDto) {
    return this.employeeHistoryService.update(id, updateEmployeeHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeHistoryService.remove(id);
  }
}
