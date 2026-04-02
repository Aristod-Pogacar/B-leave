import { PartialType } from '@nestjs/mapped-types';
import { CreateManagerAssignationDto } from './create-manager_assignation.dto';

export class UpdateManagerAssignationDto extends PartialType(CreateManagerAssignationDto) {}
