import { PartialType } from '../../../common/partial-type';
import { CreateLeaveDto } from './create-leave.dto';

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {}
