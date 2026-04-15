import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) { }

  async create(createHistoryDto: CreateHistoryDto) {
    return this.historyRepository.save(createHistoryDto);
  }

  async findAll() {
    return this.historyRepository.find();
  }

  async findOne(id: string) {
    return this.historyRepository.findOne({ where: { id } });
  }

  async update(id: string, updateHistoryDto: UpdateHistoryDto) {
    return this.historyRepository.update(id, updateHistoryDto);
  }

  remove(id: string) {
    return this.historyRepository.delete({ id });
  }
}
