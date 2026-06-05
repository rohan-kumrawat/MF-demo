import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Centre } from './entities/centre.entity';

@Injectable()
export class CentresService {
  constructor(
    @InjectRepository(Centre)
    private readonly repo: Repository<Centre>,
  ) {}

  findAll(): Promise<Centre[]> {
    return this.repo.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Centre> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Centre not found');
    return c;
  }

  async create(name: string, address?: string): Promise<Centre> {
    const c = this.repo.create({ name, address });
    return this.repo.save(c);
  }
}
