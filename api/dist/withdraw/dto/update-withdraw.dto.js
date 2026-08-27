"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWithdrawDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_withdraw_dto_1 = require("./create-withdraw.dto");
class UpdateWithdrawDto extends (0, mapped_types_1.PartialType)(create_withdraw_dto_1.CreateWithdrawDto) {
}
exports.UpdateWithdrawDto = UpdateWithdrawDto;
//# sourceMappingURL=update-withdraw.dto.js.map