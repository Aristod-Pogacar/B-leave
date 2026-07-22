import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Render, Req, Res } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/user/role.guard';
import { Roles } from 'src/user/role.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { ApproveWithDrawDto } from './dto/approve-withdraw.dto';
import { WithdrawStatus } from './entities/withdraw.entity';

@Controller('withdraw')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) { }

  @UseGuards(AuthGuard)
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL)
  @Get('tasks')
  @Render('withdraw-tasks')
  async findAllApprovedRequest(@Req() req: any, @Res() res: any) {
    console.log("USER:", req.session.user.site);
    const requests = await this.withdrawService.findBySite(req.session.user.site, WithdrawStatus.WITHDRAW_APPROVED);
    console.log("REQUESTS:", requests);
    return { title: "Approved withdraws", error: req.query.error, requests: requests, message: req.query.message }
  }

  @UseGuards(AuthGuard)
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.HR_LEAD)
  @Get('request')
  @Render('withdraw-request')
  async findAllRequest(@Req() req: any, @Res() res: any) {
    const requests = await this.withdrawService.findBySite(req.session.user.site);
    return { title: "Approuve withdraws", error: req.query.error, requests: requests, message: req.query.message }
  }

  @Post('approve/:id')
  async approve(@Req() req: any, @Res() res: any, @Param('id') id: string) {
    await this.withdrawService.approve(id, req.session.user);
    const message = "Withdraw approved successfully. The payroll department needs to confirm it."
    res.redirect('/withdraw/request?message=' + message);
  }

  @Post('done/:id')
  async done(@Req() req: any, @Res() res: any, @Param('id') id: string) {
    await this.withdrawService.done(id, req.session.user.id);
    const message = "Withdraw done successfully."
    res.redirect('/withdraw/tasks?message=' + message);
  }

  @Post('mark-done/:id')
  async markDone(@Req() req: any, @Res() res: any, @Param('id') id: string) {
    await this.withdrawService.markDone(id);
    const message = "Withdraw marked done successfully."
    res.redirect('/withdraw/tasks?message=' + message);
  }

  @Post()
  create(@Body() createWithdrawDto: CreateWithdrawDto) {
    return this.withdrawService.create(createWithdrawDto);
  }

  @Get()
  findAll() {
    return this.withdrawService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.withdrawService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWithdrawDto: UpdateWithdrawDto) {
    return this.withdrawService.update(id, updateWithdrawDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.withdrawService.remove(id);
  }
}
