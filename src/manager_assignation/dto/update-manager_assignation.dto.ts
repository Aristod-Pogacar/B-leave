import { PartialType } from '../../common/partial-type';
import { CreateManagerAssignationDto } from './create-manager_assignation.dto';
import { IsString } from 'class-validator';

export class UpdateManagerAssignationDto extends PartialType(CreateManagerAssignationDto) {

    @IsString()
    employee: string;

    @IsString()
    manager: string;

}
