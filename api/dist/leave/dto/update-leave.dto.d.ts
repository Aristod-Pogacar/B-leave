import { CreateLeaveDto } from './create-leave.dto';
declare const UpdateLeaveDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateLeaveDto>>;
export declare class UpdateLeaveDto extends UpdateLeaveDto_base {
    employee: string;
    start_date: Date;
    end_date: Date;
    leave_type: string;
    reason?: string;
}
export {};
