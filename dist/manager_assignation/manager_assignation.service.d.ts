import { CreateManagerAssignationDto } from './dto/create-manager_assignation.dto';
import { UpdateManagerAssignationDto } from './dto/update-manager_assignation.dto';
export declare class ManagerAssignationService {
    create(createManagerAssignationDto: CreateManagerAssignationDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateManagerAssignationDto: UpdateManagerAssignationDto): string;
    remove(id: number): string;
}
