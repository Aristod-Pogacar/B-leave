import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import type { Response } from 'express';

@Controller('api/leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) { }

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto, @Res() res: any) {
    console.log("APPLYING LEAVE");
    console.log("LEAVE DTO:", createLeaveDto);
    return this.leaveService.create(createLeaveDto, res);
  }

  @Get()
  findAll() {
    return this.leaveService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaveDto: UpdateLeaveDto) {
    return this.leaveService.update(+id, updateLeaveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveService.remove(+id);
  }
}
