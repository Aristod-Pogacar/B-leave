import { CreateManagerAssignationDto } from './create-manager_assignation.dto';
declare const UpdateManagerAssignationDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateManagerAssignationDto>>;
export declare class UpdateManagerAssignationDto extends UpdateManagerAssignationDto_base {
    employee: string;
    manager: string;
}
export {};
