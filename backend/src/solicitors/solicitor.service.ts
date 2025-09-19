import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between } from 'typeorm';
import { Solicitor } from './entities/solicitor.entity';
import { LegalCase, CaseStatus, CasePriority } from './entities/legal-case.entity';
import { ConveyancingTransaction, TransactionStatus } from './entities/conveyancing-transaction.entity';
import { LegalContract, ContractStatus } from './entities/legal-contract.entity';
import { CreateSolicitorDto } from './dto/create-solicitor.dto';
import { UpdateSolicitorDto } from './dto/update-solicitor.dto';
import { CreateLegalCaseDto } from './dto/create-legal-case.dto';
import { UpdateLegalCaseDto } from './dto/update-legal-case.dto';
import { CreateConveyancingTransactionDto } from './dto/create-conveyancing-transaction.dto';
import { UpdateConveyancingTransactionDto } from './dto/update-conveyancing-transaction.dto';
import { CreateLegalContractDto } from './dto/create-legal-contract.dto';
import { UpdateLegalContractDto } from './dto/update-legal-contract.dto';

@Injectable()
export class SolicitorService {
  constructor(
    @InjectRepository(Solicitor)
    private solicitorRepository: Repository<Solicitor>,
    @InjectRepository(LegalCase)
    private legalCaseRepository: Repository<LegalCase>,
    @InjectRepository(ConveyancingTransaction)
    private conveyancingRepository: Repository<ConveyancingTransaction>,
    @InjectRepository(LegalContract)
    private contractRepository: Repository<LegalContract>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Solicitor Management
  async createSolicitor(createSolicitorDto: CreateSolicitorDto): Promise<Solicitor> {
    try {
      // Get user details first
    const user = await this.userRepository.findOne({ where: { id: createSolicitorDto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const solicitor = this.solicitorRepository.create({
      userId: createSolicitorDto.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      firmName: createSolicitorDto.firmName,
      firmAddress: createSolicitorDto.firmAddress,
      registrationNumber: createSolicitorDto.registrationNumber,
      sraNumber: createSolicitorDto.registrationNumber, // Use registration number as SRA for now
      yearsOfExperience: createSolicitorDto.yearsOfExperience,
      specializations: createSolicitorDto.specializations,
      hourlyRate: createSolicitorDto.hourlyRate,
      bio: createSolicitorDto.biography,
      languages: createSolicitorDto.languages,
    });
    
    return await this.solicitorRepository.save(solicitor);
    } catch (error) {
      throw new BadRequestException('Failed to create solicitor: ' + error.message);
    }
  }

  async findAllSolicitors(page: number = 1, limit: number = 10, search?: string): Promise<{ data: Solicitor[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Solicitor> = {};

    if (search) {
      where.firmName = Like(`%${search}%`);
    }

    const [data, total] = await this.solicitorRepository.findAndCount({
      where,
      relations: ['user', 'legalCases', 'conveyancingTransactions', 'legalContracts'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findSolicitorById(id: string): Promise<Solicitor> {
    const solicitor = await this.solicitorRepository.findOne({
      where: { id },
      relations: ['user', 'legalCases', 'conveyancingTransactions', 'legalContracts'],
    });

    if (!solicitor) {
      throw new NotFoundException(`Solicitor with ID ${id} not found`);
    }

    return solicitor;
  }

  async findSolicitorByUserId(userId: string): Promise<Solicitor> {
    const solicitor = await this.solicitorRepository.findOne({
      where: { userId },
      relations: ['user', 'legalCases', 'conveyancingTransactions', 'legalContracts'],
    });

    if (!solicitor) {
      throw new NotFoundException(`Solicitor with user ID ${userId} not found`);
    }

    return solicitor;
  }

  async updateSolicitor(id: string, updateSolicitorDto: UpdateSolicitorDto): Promise<Solicitor> {
    const solicitor = await this.findSolicitorById(id);
    
    Object.assign(solicitor, updateSolicitorDto);
    
    try {
      return await this.solicitorRepository.save(solicitor);
    } catch (error) {
      throw new BadRequestException('Failed to update solicitor: ' + error.message);
    }
  }

  async deleteSolicitor(id: string): Promise<void> {
    const solicitor = await this.findSolicitorById(id);
    
    // Check if solicitor has active cases
    const activeCases = await this.legalCaseRepository.count({
      where: { solicitorId: id, status: CaseStatus.IN_PROGRESS },
    });
    
    if (activeCases > 0) {
      throw new BadRequestException('Cannot delete solicitor with active cases');
    }
    
    await this.solicitorRepository.remove(solicitor);
  }

  async getSolicitorStats(solicitorId: string): Promise<any> {
    const solicitor = await this.findSolicitorById(solicitorId);
    
    const [totalCases, activeCases, completedCases, totalTransactions, activeTransactions, completedTransactions, totalContracts, activeContracts, completedContracts] = await Promise.all([
      this.legalCaseRepository.count({ where: { solicitorId } }),
      this.legalCaseRepository.count({ where: { solicitorId, status: CaseStatus.IN_PROGRESS } }),
      this.legalCaseRepository.count({ where: { solicitorId, status: CaseStatus.CLOSED } }),
      this.conveyancingRepository.count({ where: { solicitorId } }),
      this.conveyancingRepository.count({ where: { solicitorId, status: TransactionStatus.INSTRUCTION_RECEIVED } }),
      this.conveyancingRepository.count({ where: { solicitorId, status: TransactionStatus.COMPLETED } }),
      this.contractRepository.count({ where: { solicitorId } }),
      this.contractRepository.count({ where: { solicitorId, status: ContractStatus.ACTIVE } }),
      this.contractRepository.count({ where: { solicitorId, status: ContractStatus.FULLY_EXECUTED } }),
    ]);

    return {
      solicitor: {
        id: solicitor.id,
        firmName: solicitor.firmName,
        specializations: solicitor.specializations,
      },
      cases: {
        total: totalCases,
        active: activeCases,
        completed: completedCases,
      },
      transactions: {
        total: totalTransactions,
        active: activeTransactions,
        completed: completedTransactions,
      },
      contracts: {
        total: totalContracts,
        active: activeContracts,
        completed: completedContracts,
      },
    };
  }

  // Legal Case Management
  async createLegalCase(createLegalCaseDto: CreateLegalCaseDto): Promise<LegalCase> {
    // Verify solicitor exists
    await this.findSolicitorById(createLegalCaseDto.solicitorId);
    
    try {
      const legalCase = this.legalCaseRepository.create(createLegalCaseDto);
      return await this.legalCaseRepository.save(legalCase);
    } catch (error) {
      throw new BadRequestException('Failed to create legal case: ' + error.message);
    }
  }

  async findAllLegalCases(
    page: number = 1,
    limit: number = 10,
    solicitorId?: string,
    status?: CaseStatus,
    priority?: CasePriority,
    search?: string,
  ): Promise<{ data: LegalCase[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<LegalCase> = {};

    if (solicitorId) where.solicitorId = solicitorId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = Like(`%${search}%`);

    const [data, total] = await this.legalCaseRepository.findAndCount({
      where,
      relations: ['client', 'solicitor', 'tasks', 'documents', 'communicationLogs'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findLegalCaseById(id: string): Promise<LegalCase> {
    const legalCase = await this.legalCaseRepository.findOne({
      where: { id },
      relations: ['client', 'solicitor', 'tasks', 'documents', 'communicationLogs'],
    });

    if (!legalCase) {
      throw new NotFoundException(`Legal case with ID ${id} not found`);
    }

    return legalCase;
  }

  async updateLegalCase(id: string, updateLegalCaseDto: UpdateLegalCaseDto): Promise<LegalCase> {
    const legalCase = await this.findLegalCaseById(id);
    
    Object.assign(legalCase, updateLegalCaseDto);
    
    try {
      return await this.legalCaseRepository.save(legalCase);
    } catch (error) {
      throw new BadRequestException('Failed to update legal case: ' + error.message);
    }
  }

  async deleteLegalCase(id: string): Promise<void> {
    const legalCase = await this.findLegalCaseById(id);
    await this.legalCaseRepository.remove(legalCase);
  }

  async updateCaseStatus(id: string, status: CaseStatus): Promise<LegalCase> {
    const legalCase = await this.findLegalCaseById(id);
    legalCase.status = status;
    
    if (status === CaseStatus.CLOSED) {
      legalCase.actualCompletionDate = new Date();
    }
    
    return await this.legalCaseRepository.save(legalCase);
  }

  // Conveyancing Transaction Management
  async createConveyancingTransaction(createTransactionDto: CreateConveyancingTransactionDto): Promise<ConveyancingTransaction> {
    // Verify solicitor exists
    await this.findSolicitorById(createTransactionDto.solicitorId);
    
    try {
      const transaction = this.conveyancingRepository.create(createTransactionDto);
      return await this.conveyancingRepository.save(transaction);
    } catch (error) {
      throw new BadRequestException('Failed to create conveyancing transaction: ' + error.message);
    }
  }

  async findAllConveyancingTransactions(
    page: number = 1,
    limit: number = 10,
    solicitorId?: string,
    status?: TransactionStatus,
    search?: string,
  ): Promise<{ data: ConveyancingTransaction[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<ConveyancingTransaction> = {};

    if (solicitorId) where.solicitorId = solicitorId;
    if (status) where.status = status;
    if (search) where.propertyAddress = Like(`%${search}%`);

    const [data, total] = await this.conveyancingRepository.findAndCount({
      where,
      relations: ['client', 'solicitor', 'documents'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findConveyancingTransactionById(id: string): Promise<ConveyancingTransaction> {
    const transaction = await this.conveyancingRepository.findOne({
      where: { id },
      relations: ['client', 'solicitor', 'documents'],
    });

    if (!transaction) {
      throw new NotFoundException(`Conveyancing transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async updateConveyancingTransaction(id: string, updateTransactionDto: UpdateConveyancingTransactionDto): Promise<ConveyancingTransaction> {
    const transaction = await this.findConveyancingTransactionById(id);
    
    Object.assign(transaction, updateTransactionDto);
    
    try {
      return await this.conveyancingRepository.save(transaction);
    } catch (error) {
      throw new BadRequestException('Failed to update conveyancing transaction: ' + error.message);
    }
  }

  async deleteConveyancingTransaction(id: string): Promise<void> {
    const transaction = await this.findConveyancingTransactionById(id);
    await this.conveyancingRepository.remove(transaction);
  }

  async updateTransactionStatus(id: string, status: TransactionStatus): Promise<ConveyancingTransaction> {
    const transaction = await this.findConveyancingTransactionById(id);
    transaction.status = status;
    
    if (status === TransactionStatus.COMPLETED) {
      transaction.actualCompletionDate = new Date();
    }
    
    return await this.conveyancingRepository.save(transaction);
  }

  // Legal Contract Management
  async createLegalContract(createContractDto: CreateLegalContractDto): Promise<LegalContract> {
    // Verify solicitor exists
    await this.findSolicitorById(createContractDto.solicitorId);
    
    try {
      const contract = this.contractRepository.create({
      contractType: createContractDto.contractType,
      title: createContractDto.title,
      description: createContractDto.description,
      clientId: createContractDto.clientId,
      solicitorId: createContractDto.solicitorId,
      contractValue: createContractDto.contractValue,
      currency: createContractDto.currency || 'GBP',
      startDate: createContractDto.startDate ? new Date(createContractDto.startDate) : undefined,
      endDate: createContractDto.endDate ? new Date(createContractDto.endDate) : undefined,
      noticePeriodDays: createContractDto.noticePeriodDays,
      governingLaw: createContractDto.governingLaw || 'English Law',
      jurisdiction: createContractDto.jurisdiction || 'England and Wales',
      paymentTerms: createContractDto.paymentTerms,
      deliveryTerms: createContractDto.deliveryTerms,
      insuranceRequirements: createContractDto.insuranceRequirements,
      complianceRequirements: createContractDto.complianceRequirements,
      regulatoryApprovals: createContractDto.regulatoryApprovalsRequired,
      notes: createContractDto.notes,
      clientInstructions: createContractDto.clientInstructions,
      specialConditions: createContractDto.specialConditions?.join('; '), // Convert array to string
      priority: createContractDto.priority as any, // Convert string to enum
    });
      return await this.contractRepository.save(contract);
    } catch (error) {
      throw new BadRequestException('Failed to create legal contract: ' + error.message);
    }
  }

  async findAllLegalContracts(
    page: number = 1,
    limit: number = 10,
    solicitorId?: string,
    status?: ContractStatus,
    search?: string,
  ): Promise<{ data: LegalContract[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<LegalContract> = {};

    if (solicitorId) where.solicitorId = solicitorId;
    if (status) where.status = status;
    if (search) where.title = Like(`%${search}%`);

    const [data, total] = await this.contractRepository.findAndCount({
      where,
      relations: ['client', 'solicitor', 'parties', 'clauses', 'amendments', 'obligations'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findLegalContractById(id: string): Promise<LegalContract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['client', 'solicitor', 'parties', 'clauses', 'amendments', 'obligations'],
    });

    if (!contract) {
      throw new NotFoundException(`Legal contract with ID ${id} not found`);
    }

    return contract;
  }

  async updateLegalContract(id: string, updateContractDto: UpdateLegalContractDto): Promise<LegalContract> {
    const contract = await this.findLegalContractById(id);
    
    Object.assign(contract, updateContractDto);
    
    try {
      return await this.contractRepository.save(contract);
    } catch (error) {
      throw new BadRequestException('Failed to update legal contract: ' + error.message);
    }
  }

  async deleteLegalContract(id: string): Promise<void> {
    const contract = await this.findLegalContractById(id);
    await this.contractRepository.remove(contract);
  }

  async updateContractStatus(id: string, status: ContractStatus): Promise<LegalContract> {
    const contract = await this.findLegalContractById(id);
    contract.status = status;
    
    // Update contract status - dates are managed through milestones
    // No direct effectiveDate or terminationDate properties on contract
    
    return await this.contractRepository.save(contract);
  }

  // Dashboard and Analytics
  async getDashboardStats(solicitorId?: string): Promise<any> {
    const where = solicitorId ? { solicitorId } : {};
    
    const [totalCases, activeCases, totalTransactions, activeTransactions, totalContracts, activeContracts, recentCases, recentTransactions, recentContracts] = await Promise.all([
      this.legalCaseRepository.count({ where }),
      this.legalCaseRepository.count({ where: { ...where, status: CaseStatus.IN_PROGRESS } }),
      this.conveyancingRepository.count({ where }),
      this.conveyancingRepository.count({ where: { ...where, status: TransactionStatus.INSTRUCTION_RECEIVED } }),
      this.contractRepository.count({ where }),
      this.contractRepository.count({ where: { ...where, status: ContractStatus.ACTIVE } }),
      this.legalCaseRepository.find({
        where,
        relations: ['client', 'solicitor'],
        order: { createdAt: 'DESC' },
        take: 5,
      }),
      this.conveyancingRepository.find({
        where,
        relations: ['client', 'solicitor'],
        order: { createdAt: 'DESC' },
        take: 5,
      }),
      this.contractRepository.find({
        where,
        relations: ['client', 'solicitor'],
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    return {
      overview: {
        totalCases,
        activeCases,
        totalTransactions,
        activeTransactions,
        totalContracts,
        activeContracts,
      },
      recent: {
        cases: recentCases,
        transactions: recentTransactions,
        contracts: recentContracts,
      },
    };
  }

  async getWorkloadAnalysis(solicitorId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const dateFilter = startDate && endDate ? {
      createdAt: Between(startDate, endDate),
    } : {};

    const [casesByPriority, transactionsByStatus, contractsByStatus] = await Promise.all([
      this.legalCaseRepository
        .createQueryBuilder('case')
        .select('case.priority', 'priority')
        .addSelect('COUNT(*)', 'count')
        .where('case.solicitorId = :solicitorId', { solicitorId })
        .andWhere(dateFilter)
        .groupBy('case.priority')
        .getRawMany(),
      this.conveyancingRepository
        .createQueryBuilder('transaction')
        .select('transaction.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('transaction.solicitorId = :solicitorId', { solicitorId })
        .andWhere(dateFilter)
        .groupBy('transaction.status')
        .getRawMany(),
      this.contractRepository
        .createQueryBuilder('contract')
        .select('contract.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('contract.solicitorId = :solicitorId', { solicitorId })
        .andWhere(dateFilter)
        .groupBy('contract.status')
        .getRawMany(),
    ]);

    return {
      casesByPriority,
      transactionsByStatus,
      contractsByStatus,
    };
  }

  // Utility methods for role-based access control
  async validateSolicitorAccess(solicitorId: string, userId: string): Promise<boolean> {
    const solicitor = await this.solicitorRepository.findOne({
      where: { id: solicitorId, userId },
    });
    
    return !!solicitor;
  }

  async validateCaseAccess(caseId: string, solicitorId: string): Promise<boolean> {
    const legalCase = await this.legalCaseRepository.findOne({
      where: { id: caseId, solicitorId },
    });
    
    return !!legalCase;
  }

  async validateTransactionAccess(transactionId: string, solicitorId: string): Promise<boolean> {
    const transaction = await this.conveyancingRepository.findOne({
      where: { id: transactionId, solicitorId },
    });
    
    return !!transaction;
  }

  async validateContractAccess(contractId: string, solicitorId: string): Promise<boolean> {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId, solicitorId },
    });
    
    return !!contract;
  }
}
