import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarriedForwardService } from './carried-forward.service';
import { CreateCarriedForwardDto } from './dto/create-carried-forward.dto';
import { UpdateCarriedForwardDto } from './dto/update-carried-forward.dto';

@Controller('carried-forward')
export class CarriedForwardController {
  constructor(private readonly carriedForwardService: CarriedForwardService) { }

  @Post()
  create(@Body() createCarriedForwardDto: CreateCarriedForwardDto) {
    return this.carriedForwardService.create(createCarriedForwardDto);
  }

  @Get()
  findAll() {
    return this.carriedForwardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carriedForwardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarriedForwardDto: UpdateCarriedForwardDto) {
    return this.carriedForwardService.update(+id, updateCarriedForwardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carriedForwardService.remove(+id);
  }
}
