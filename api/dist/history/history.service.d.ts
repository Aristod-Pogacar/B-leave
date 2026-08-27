import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { History } from './entities/history.entity';
import { Repository } from 'typeorm';
export declare class HistoryService {
    private readonly historyRepository;
    constructor(historyRepository: Repository<History>);
    paginate(search: string, page: number, limit: number, start_date: string, end_date: string): Promise<{
        data: History[];
        total: number;
        totalPages: number;
    }>;
    create(createHistoryDto: CreateHistoryDto): Promise<CreateHistoryDto & History>;
    findAll(): Promise<History[]>;
    findOne(id: string): Promise<History | null>;
    update(id: string, updateHistoryDto: UpdateHistoryDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
