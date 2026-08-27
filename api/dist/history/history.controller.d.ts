import { HistoryService } from './history.service';
export declare class HistoryController {
    private readonly historyService;
    constructor(historyService: HistoryService);
    bLeaveHistory(req: any, search?: string, page?: number, startDate?: string, endDate?: string): Promise<{
        title: string;
        histories: import("./entities/history.entity").History[];
        total: number;
        totalPages: number;
        currentPage: number;
        startPage: number;
        endPage: number;
        search: string;
        startDate: string;
        endDate: string;
    }>;
}
