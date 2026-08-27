import { CarriedForwardService } from './carried-forward.service';
import { CreateCarriedForwardDto } from './dto/create-carried-forward.dto';
import { UpdateCarriedForwardDto } from './dto/update-carried-forward.dto';
export declare class CarriedForwardController {
    private readonly carriedForwardService;
    constructor(carriedForwardService: CarriedForwardService);
    create(createCarriedForwardDto: CreateCarriedForwardDto): Promise<import("./entities/carried-forward.entity").CarriedForward>;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateCarriedForwardDto: UpdateCarriedForwardDto): string;
    remove(id: string): string;
}
