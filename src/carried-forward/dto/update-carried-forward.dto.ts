import { PartialType } from '@nestjs/mapped-types';
import { CreateCarriedForwardDto } from './create-carried-forward.dto';

export class UpdateCarriedForwardDto extends PartialType(CreateCarriedForwardDto) {}
