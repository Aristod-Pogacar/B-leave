import { CreateMedicalServiceDto } from './create-medical_service.dto';
declare const UpdateMedicalServiceDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateMedicalServiceDto>>;
export declare class UpdateMedicalServiceDto extends UpdateMedicalServiceDto_base {
    name: string;
}
export {};
