import { CreateSmiaOstieDto } from './create-smia_ostie.dto';
declare const UpdateSmiaOstieDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateSmiaOstieDto>>;
export declare class UpdateSmiaOstieDto extends UpdateSmiaOstieDto_base {
    employee: string;
    date?: Date;
    reason?: string;
}
export {};
