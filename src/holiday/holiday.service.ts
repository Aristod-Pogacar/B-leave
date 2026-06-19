import { Injectable } from '@nestjs/common';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { Repository, Between } from 'typeorm';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private holidayRepository: Repository<Holiday>,
  ) { }

  async findByDateRange(start_date: string, end_date: string) {
    return await this.holidayRepository.find({
      where: {
        date: Between(
          new Date(start_date),
          new Date(end_date)
        )
      }
    });
  }

  async findAllByYear(year: number) {
    const holidays = await this.holidayRepository.find({
      where: {
        date: Between(
          new Date(year, 0, 0),
          new Date(year, 12, 0)
        )
      }
    });
    return holidays;
  }

  create(createHolidayDto: CreateHolidayDto) {
    return this.holidayRepository.save(createHolidayDto);
  }

  findAll() {
    return this.holidayRepository.find();
  }

  findOne(id: string) {
    return this.holidayRepository.findOne({ where: { id } });
  }

  update(id: string, updateHolidayDto: UpdateHolidayDto) {
    return this.holidayRepository.update(id, updateHolidayDto);
  }

  remove(id: string) {
    return this.holidayRepository.delete(id);
  }
}
