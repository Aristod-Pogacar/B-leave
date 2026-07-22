import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get('mark-as-read/:id')
  async markAsRead(@Param('id') id: string) {
    return await this.notificationService.markAsRead(id);
  }

  @Get('mark-all-as-read')
  async markAllAsRead(@Req() req: any, @Res() res: any) {
    const [notifications] = await this.notificationService.getUnreadNotifications(req.session.user.id);
    if (notifications) {
      notifications.forEach(async (notification: any) => {
        await this.notificationService.markAsRead(notification.id);
      });
    }
    return res.status(200).json({ message: 'All notifications marked as read' });
  }

  @Get('redirect/:id')
  async redirect(@Param('id') id: string, @Res() res: any) {
    await this.notificationService.markAsRead(id);
    const data = await this.notificationService.findOne(id);
    if (data) {
      return res.redirect(data.url);
    } else {
      return res.redirect('/');
    }
  }

  // @Get()
  // findAll() {
  //   return this.notificationService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.notificationService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
  //   return this.notificationService.update(+id, updateNotificationDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.notificationService.remove(+id);
  // }
}
