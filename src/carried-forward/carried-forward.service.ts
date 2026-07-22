import { Injectable } from '@nestjs/common';
import { CreateCarriedForwardDto } from './dto/create-carried-forward.dto';
import { UpdateCarriedForwardDto } from './dto/update-carried-forward.dto';
import { CarriedForward } from './entities/carried-forward.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CarriedForwardService {

  constructor(
    @InjectRepository(CarriedForward)
    private readonly carriedForwardRepository: Repository<CarriedForward>,
  ) { }

  async addAll(data: CarriedForward[]) {
    return await this.carriedForwardRepository.save(data);
  }

  create(createCarriedForwardDto: CreateCarriedForwardDto) {
    const newCarriedForward = this.carriedForwardRepository.create(createCarriedForwardDto);
    return this.carriedForwardRepository.save(newCarriedForward);
  }

  findAll() {
    return `This action returns all carriedForward`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carriedForward`;
  }

  update(id: number, updateCarriedForwardDto: UpdateCarriedForwardDto) {
    return `This action updates a #${id} carriedForward`;
  }

  remove(id: number) {
    return `This action removes a #${id} carriedForward`;
  }
}
