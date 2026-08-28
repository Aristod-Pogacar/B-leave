import { PartialType } from '../../common/partial-type';
import { CreateEmployeeHistoryDto } from './create-employee-history.dto';

export class UpdateEmployeeHistoryDto extends PartialType(CreateEmployeeHistoryDto) {}
