import { Controller, Get, Post, Body, Patch, Param, Delete, Render, Req, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { RolesGuard } from 'src/user/role.guard';
import { Roles } from 'src/user/role.decorator';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) { }

  @Get('b-leave-history')
  @Render('b-leave-history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async bLeaveHistory(@Req() req: any) {
    const histories = await this.historyService.findAll();
    return { title: "B-Leave History", histories: histories };
  }

  @Post()
  create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @Get()
  findAll() {
    return this.historyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistoryDto: UpdateHistoryDto) {
    return this.historyService.update(id, updateHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historyService.remove(id);
  }
}
