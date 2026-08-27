"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmployeeHistoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_employee_history_dto_1 = require("./create-employee-history.dto");
class UpdateEmployeeHistoryDto extends (0, mapped_types_1.PartialType)(create_employee_history_dto_1.CreateEmployeeHistoryDto) {
}
exports.UpdateEmployeeHistoryDto = UpdateEmployeeHistoryDto;
//# sourceMappingURL=update-employee-history.dto.js.map