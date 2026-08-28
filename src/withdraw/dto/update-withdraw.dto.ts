import { PartialType } from '../../common/partial-type';
import { CreateWithdrawDto } from './create-withdraw.dto';

export class UpdateWithdrawDto extends PartialType(CreateWithdrawDto) {}
