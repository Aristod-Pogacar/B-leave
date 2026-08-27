import { CreatePermission2hDto } from './create-permission2h.dto';
declare const UpdatePermission2hDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePermission2hDto>>;
export declare class UpdatePermission2hDto extends UpdatePermission2hDto_base {
    reason?: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    expectedStartTime: string;
    expectedEndTime: string;
    employee: string;
}
export {};
