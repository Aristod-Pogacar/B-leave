import { Injectable } from '@nestjs/common';
import { CreateManagerAssignationDto } from './dto/create-manager_assignation.dto';
import { UpdateManagerAssignationDto } from './dto/update-manager_assignation.dto';

@Injectable()
export class ManagerAssignationService {
  create(createManagerAssignationDto: CreateManagerAssignationDto) {
    return 'This action adds a new managerAssignation';
  }

  findAll() {
    return `This action returns all managerAssignation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} managerAssignation`;
  }

  update(id: number, updateManagerAssignationDto: UpdateManagerAssignationDto) {
    return `This action updates a #${id} managerAssignation`;
  }

  remove(id: number) {
    return `This action removes a #${id} managerAssignation`;
  }
}
