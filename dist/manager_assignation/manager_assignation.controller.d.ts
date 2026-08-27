import { ManagerAssignationService } from './manager_assignation.service';
import { CreateManagerAssignationDto } from './dto/create-manager_assignation.dto';
import { UpdateManagerAssignationDto } from './dto/update-manager_assignation.dto';
export declare class ManagerAssignationController {
    private readonly managerAssignationService;
    constructor(managerAssignationService: ManagerAssignationService);
    create(createManagerAssignationDto: CreateManagerAssignationDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateManagerAssignationDto: UpdateManagerAssignationDto): string;
    remove(id: string): string;
}
