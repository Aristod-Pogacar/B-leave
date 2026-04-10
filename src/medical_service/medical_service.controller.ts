import { Controller, Get, Post, Body, Patch, Param, Delete, Render, Req, Query, UseGuards, Res } from '@nestjs/common';
import { MedicalServiceService } from './medical_service.service';
import { CreateMedicalServiceDto } from './dto/create-medical_service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical_service.dto';
import { Roles } from 'src/user/role.decorator';
import { RolesGuard } from 'src/user/role.guard';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('medical-service')
export class MedicalServiceController {
  constructor(private readonly medicalServiceService: MedicalServiceService) { }

  @Get('list')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @Render('medical-service-setting')
  async getMedicalService(@Req() req, @Query('search') search: string = '', @Query('page') page: number = 1) {
    const limit = 20;
    const { data, total, totalPages } = await this.medicalServiceService.paginateMedicalService(search, Number(page), limit);
    // console.log("DATA:", data);

    const currentPage = Number(page);
    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    return {
      title: 'Medical Service Setting',
      data,
      search,
      total,
      totalPages,
      startPage,
      endPage,
      currentPage
    };
  }

  @Get('new-medical-service')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PAYROLL, UserRole.SUPERADMIN, UserRole.HR_ADMIN)
  @Render('new-medical-service')
  async getNewMedicalService(@Req() req) {
    return {
      title: 'New Medical Service',
      user: req.session.user,
    };
  }

  @Post('new-medical-service')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PAYROLL, UserRole.SUPERADMIN, UserRole.HR_ADMIN)
  async postNewMedicalService(@Req() req, @Body() body: CreateMedicalServiceDto, @Res() res: any) {
    if (body.name == "") {
      return res.render('new-medical-service', {
        title: 'New Medical Service',
        user: req.session.user,
        error: 'Name is required',
      });
    }
    const existingMedicalService = await this.medicalServiceService.findOneByName(body.name);
    if (existingMedicalService) {
      return res.render('new-medical-service', {
        title: 'New Medical Service',
        user: req.session.user,
        error: 'Medical service already exists',
      });
    }
    console.log("Name:", body.name);
    await this.medicalServiceService.create({ name: body.name });
    return res.redirect('/medical-service/list');
  }

  @Get('edit-medical-service/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PAYROLL, UserRole.SUPERADMIN, UserRole.HR_ADMIN)
  @Render('edit-medical-service')
  async getEditMedicalService(@Req() req, @Param('id') id: string) {
    const medicalService = await this.medicalServiceService.findOne(id);
    return {
      title: 'Edit Medical Service',
      user: req.session.user,
      data: medicalService,
    };
  }

  @Post('edit-medical-service/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PAYROLL, UserRole.SUPERADMIN, UserRole.HR_ADMIN)
  async postEditMedicalService(@Req() req, @Param('id') id: string, @Body() body: UpdateMedicalServiceDto, @Res() res: any) {
    if (body.name == "") {
      return res.render('edit-medical-service', {
        title: 'Edit Medical Service',
        user: req.session.user,
        error: 'Name is required',
      });
    }
    const existingMedicalService = await this.medicalServiceService.findOneByName(body.name);
    if (existingMedicalService) {
      return res.render('new-medical-service', {
        title: 'New Medical Service',
        user: req.session.user,
        error: 'Medical service already exists',
      });
    }
    console.log("Name:", body.name);
    await this.medicalServiceService.update(id, { name: body.name });
    return res.redirect('/medical-service/list');
  }

  @Post("delete-medical-service/:id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PAYROLL, UserRole.SUPERADMIN, UserRole.HR_ADMIN)
  async deleteMedicalService(@Req() req, @Param('id') id: string, @Res() res: any) {
    await this.medicalServiceService.remove(id);
    return res.redirect('/medical-service/list');
  }

  @Post()
  create(@Body() createMedicalServiceDto: CreateMedicalServiceDto) {
    return this.medicalServiceService.create(createMedicalServiceDto);
  }

  @Get()
  findAll() {
    return this.medicalServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalServiceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicalServiceDto: UpdateMedicalServiceDto) {
    return this.medicalServiceService.update(id, updateMedicalServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalServiceService.remove(id);
  }

}
