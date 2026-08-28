import { PartialType } from '../../common/partial-type';
import { CreateCarriedForwardDto } from './create-carried-forward.dto';

export class UpdateCarriedForwardDto extends PartialType(CreateCarriedForwardDto) {}
