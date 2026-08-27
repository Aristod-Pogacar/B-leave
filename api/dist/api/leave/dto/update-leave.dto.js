"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLeaveDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_leave_dto_1 = require("./create-leave.dto");
class UpdateLeaveDto extends (0, mapped_types_1.PartialType)(create_leave_dto_1.CreateLeaveDto) {
}
exports.UpdateLeaveDto = UpdateLeaveDto;
//# sourceMappingURL=update-leave.dto.js.map