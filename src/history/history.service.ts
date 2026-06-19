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

  async paginate(search: string, page: number, limit: number, start_date: string, end_date: string) {
    const query = this.historyRepository.createQueryBuilder('h');
    query.orderBy('h.date_at', 'DESC');

    if (search && search.trim() !== '') {
      query.andWhere(
        'h.reason LIKE :s OR h.message LIKE :s OR h.created_by LIKE :s',
        { s: `%${search}%` }
      );
    }

    if (start_date && start_date.trim() !== '') {
      query.andWhere('h.date_at >= :start_date', { start_date });
    }

    if (end_date && end_date.trim() !== '') {
      query.andWhere('h.date_at <= :end_date', { end_date });
    }
    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, totalPages: Math.ceil(total / limit) };
  }

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
