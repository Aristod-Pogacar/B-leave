import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { Holiday } from './entities/holiday.entity';
import { Repository } from 'typeorm';
export declare class HolidayService {
    private holidayRepository;
    constructor(holidayRepository: Repository<Holiday>);
    findByDateRange(start_date: string, end_date: string): Promise<Holiday[]>;
    findAllByYear(year: number): Promise<Holiday[]>;
    findBetweenDate(start_date: string, end_date: string): Promise<Holiday[]>;
    create(createHolidayDto: CreateHolidayDto): Promise<CreateHolidayDto & Holiday>;
    findAll(): Promise<Holiday[]>;
    findOne(id: string): Promise<Holiday | null>;
    update(id: string, updateHolidayDto: UpdateHolidayDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
