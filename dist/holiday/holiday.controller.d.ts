import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { HistoryService } from '../history/history.service';
export declare class HolidayController {
    private readonly holidayService;
    private readonly historyService;
    constructor(holidayService: HolidayService, historyService: HistoryService);
    getByDate(start_date: string, end_date: string): Promise<import("./entities/holiday.entity").Holiday[]>;
    getHolidays(req: any, res: any, year: string): Promise<{
        title: string;
        holidays: import("./entities/holiday.entity").Holiday[];
        user: any;
        years: number[];
        currentYear: any;
    }>;
    postEditHolidays(req: any, createHolidayDto: CreateHolidayDto, res: any, id: string): Promise<any>;
    getDeleteHolidays(req: any, res: any, id: string): Promise<{
        title: string;
        holiday: import("./entities/holiday.entity").Holiday | null;
        user: any;
    }>;
    postDeleteHolidays(req: any, res: any, id: string): Promise<any>;
    postNewHolidays(req: any, createHolidayDto: CreateHolidayDto, res: any): Promise<any>;
    getEditHolidays(req: any, res: any, id: string): Promise<{
        title: string;
        holiday: import("./entities/holiday.entity").Holiday | null;
        user: any;
    }>;
    getNewHolidays(req: any, res: any): Promise<{
        title: string;
        user: any;
        years: number[];
    }>;
    create(createHolidayDto: CreateHolidayDto): Promise<CreateHolidayDto & import("./entities/holiday.entity").Holiday>;
    findAll(): Promise<import("./entities/holiday.entity").Holiday[]>;
    findOne(id: string): Promise<import("./entities/holiday.entity").Holiday | null>;
    update(id: string, updateHolidayDto: UpdateHolidayDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
