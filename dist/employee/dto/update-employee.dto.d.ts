import { CreateEmployeeDto } from './create-employee.dto';
declare const UpdateEmployeeDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateEmployeeDto>>;
export declare class UpdateEmployeeDto extends UpdateEmployeeDto_base {
    departement: string;
    section: string;
    line: string;
    matricule: string;
    gender: string;
    DOE: Date;
    division: string;
    div: string;
    name: string;
    firstname?: string;
    job_level: string;
    designation: string;
    type: string;
    site: string;
    managerId?: string;
}
export {};
