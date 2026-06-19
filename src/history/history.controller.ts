import { Controller, Get, Post, Body, Patch, Param, Delete, Render, Req, UseGuards, Query } from '@nestjs/common';
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
  async bLeaveHistory(
    @Req() req,
    @Query('search') search: string = '',
    @Query('page') page: number = 1,
    @Query('startDate') startDate: string = new Date().toISOString().split('T')[0],
    @Query('endDate') endDate: string = new Date().toISOString().split('T')[0],
  ) {
    const limit = 20;
    const { data, total, totalPages } = await this.historyService.paginate(
      search,
      Number(page),
      limit,
      startDate,
      endDate
    );;

    const currentPage = Number(page);
    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    return {
      title: "B-Leave History",
      histories: data,
      total,
      totalPages,
      currentPage,
      startPage,
      endPage,
      search,
      startDate,
      endDate,
    };
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
