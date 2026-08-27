import { CreateCarriedForwardDto } from './dto/create-carried-forward.dto';
import { UpdateCarriedForwardDto } from './dto/update-carried-forward.dto';
import { CarriedForward } from './entities/carried-forward.entity';
import { Repository } from 'typeorm';
export declare class CarriedForwardService {
    private readonly carriedForwardRepository;
    constructor(carriedForwardRepository: Repository<CarriedForward>);
    addAll(data: CarriedForward[]): Promise<CarriedForward[]>;
    create(createCarriedForwardDto: CreateCarriedForwardDto): Promise<CarriedForward>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateCarriedForwardDto: UpdateCarriedForwardDto): string;
    remove(id: number): string;
}
