import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ManagerAssignationService } from './manager_assignation.service';
import { CreateManagerAssignationDto } from './dto/create-manager_assignation.dto';
import { UpdateManagerAssignationDto } from './dto/update-manager_assignation.dto';

@Controller('manager-assignation')
export class ManagerAssignationController {
  constructor(private readonly managerAssignationService: ManagerAssignationService) {}

  @Post()
  create(@Body() createManagerAssignationDto: CreateManagerAssignationDto) {
    return this.managerAssignationService.create(createManagerAssignationDto);
  }

  @Get()
  findAll() {
    return this.managerAssignationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.managerAssignationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateManagerAssignationDto: UpdateManagerAssignationDto) {
    return this.managerAssignationService.update(+id, updateManagerAssignationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.managerAssignationService.remove(+id);
  }
}
