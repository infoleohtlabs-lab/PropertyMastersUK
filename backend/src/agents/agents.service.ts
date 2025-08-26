import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from './entities/agent.entity';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentsRepository: Repository<Agent>,
  ) {}

  async create(createAgentDto: any): Promise<Agent> {
    const agent = this.agentsRepository.create(createAgentDto);
    return await this.agentsRepository.save(agent) as unknown as Agent;
  }

  async findAll(): Promise<Agent[]> {
    return this.agentsRepository.find({
      relations: ['user'],
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Agent> {
    const agent = await this.agentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }

  async findByUserId(userId: string): Promise<Agent> {
    const agent = await this.agentsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!agent) {
      throw new NotFoundException('Agent profile not found');
    }

    return agent;
  }

  async update(id: string, updateData: Partial<Agent>): Promise<Agent> {
    await this.agentsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.agentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Agent not found');
    }
  }
}