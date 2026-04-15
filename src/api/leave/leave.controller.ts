import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import type { Response } from 'express';
import { HistoryService } from 'src/history/history.service';
import { HistoryReason } from 'src/history/entities/history.entity';

@Controller('api/leave')
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly historyService: HistoryService
  ) { }

  @Post()
  async create(@Body() createLeaveDto: CreateLeaveDto, @Res() res: any) {
    const leave = await this.leaveService.create(createLeaveDto, res);
    await this.historyService.create({
      reason: HistoryReason.LEAVE,
      message: "New leave send by API. Leave ID: " + leave.id,

    });
    return leave;
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
