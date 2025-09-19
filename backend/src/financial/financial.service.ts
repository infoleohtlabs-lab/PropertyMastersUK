import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType } from './entities/transaction.entity';
import { Invoice, InvoiceStatus, InvoiceType } from './entities/invoice.entity';
import { FinancialReport, ReportStatus, ReportType } from './entities/financial-report.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  CreateFinancialReportDto,
  UpdateFinancialReportDto
} from './dto';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(FinancialReport)
    private financialReportRepository: Repository<FinancialReport>,
  ) {}

  // Transaction methods
  async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      status: createTransactionDto.status || TransactionStatus.PENDING,
      currency: createTransactionDto.currency || 'GBP',
    });
    return this.transactionRepository.save(transaction);
  }

  async findAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      relations: ['user', 'property', 'relatedTransaction'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTransactionById(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user', 'property', 'relatedTransaction'],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async updateTransaction(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findTransactionById(id);
    Object.assign(transaction, updateTransactionDto);
    return this.transactionRepository.save(transaction);
  }

  async removeTransaction(id: string): Promise<void> {
    const transaction = await this.findTransactionById(id);
    await this.transactionRepository.remove(transaction);
  }

  async findTransactionsByUser(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTransactionsByProperty(propertyId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { propertyId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTransactionsByStatus(status: TransactionStatus): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { status },
      relations: ['user', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTransactionsByType(type: TransactionType): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { type },
      relations: ['user', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['user', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  // Invoice methods
  async createInvoice(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      status: createInvoiceDto.status || InvoiceStatus.DRAFT,
      currency: createInvoiceDto.currency || 'GBP',
      paidAmount: createInvoiceDto.paidAmount || 0,
      outstandingAmount: createInvoiceDto.outstandingAmount || createInvoiceDto.totalAmount,
    });
    return this.invoiceRepository.save(invoice);
  }

  async findAllInvoices(): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      relations: ['creator', 'recipient', 'property', 'transactions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['creator', 'recipient', 'property', 'transactions'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);
    Object.assign(invoice, updateInvoiceDto);
    return this.invoiceRepository.save(invoice);
  }

  async removeInvoice(id: string): Promise<void> {
    const invoice = await this.findInvoiceById(id);
    await this.invoiceRepository.remove(invoice);
  }

  async findInvoicesByCreator(createdBy: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { createdBy },
      relations: ['recipient', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findInvoicesByRecipient(invoiceTo: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { invoiceTo },
      relations: ['creator', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findInvoicesByProperty(propertyId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { propertyId },
      relations: ['creator', 'recipient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findInvoicesByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { status },
      relations: ['creator', 'recipient', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date();
    return this.invoiceRepository.createQueryBuilder('invoice')
      .where('invoice.dueDate < :today', { today })
      .andWhere('invoice.status IN (:...statuses)', { 
        statuses: [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.OVERDUE] 
      })
      .leftJoinAndSelect('invoice.creator', 'creator')
      .leftJoinAndSelect('invoice.recipient', 'recipient')
      .leftJoinAndSelect('invoice.property', 'property')
      .orderBy('invoice.dueDate', 'ASC')
      .getMany();
  }

  async markInvoiceAsPaid(id: string, paidAmount: number): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);
    invoice.paidAmount = (invoice.paidAmount || 0) + paidAmount;
    invoice.outstandingAmount = invoice.totalAmount - invoice.paidAmount;
    
    if (invoice.outstandingAmount <= 0) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidAt = new Date();
    } else {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }
    
    return this.invoiceRepository.save(invoice);
  }

  // Financial Report methods
  async createFinancialReport(createFinancialReportDto: CreateFinancialReportDto): Promise<FinancialReport> {
    const report = this.financialReportRepository.create({
      ...createFinancialReportDto,
      status: createFinancialReportDto.status || ReportStatus.GENERATING,
      generationStartedAt: new Date(),
    });
    return this.financialReportRepository.save(report);
  }

  async findAllFinancialReports(): Promise<FinancialReport[]> {
    return this.financialReportRepository.find({
      relations: ['generator', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findFinancialReportById(id: string): Promise<FinancialReport> {
    const report = await this.financialReportRepository.findOne({
      where: { id },
      relations: ['generator', 'property'],
    });
    if (!report) {
      throw new NotFoundException(`Financial report with ID ${id} not found`);
    }
    return report;
  }

  async updateFinancialReport(id: string, updateFinancialReportDto: UpdateFinancialReportDto): Promise<FinancialReport> {
    const report = await this.findFinancialReportById(id);
    Object.assign(report, updateFinancialReportDto);
    return this.financialReportRepository.save(report);
  }

  async removeFinancialReport(id: string): Promise<void> {
    const report = await this.findFinancialReportById(id);
    await this.financialReportRepository.remove(report);
  }

  async findReportsByGenerator(generatedBy: string): Promise<FinancialReport[]> {
    return this.financialReportRepository.find({
      where: { generatedBy },
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findReportsByProperty(propertyId: string): Promise<FinancialReport[]> {
    return this.financialReportRepository.find({
      where: { propertyId },
      relations: ['generator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findReportsByType(type: ReportType): Promise<FinancialReport[]> {
    return this.financialReportRepository.find({
      where: { type },
      relations: ['generator', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async generateIncomeStatement(propertyId: string, startDate: Date, endDate: Date): Promise<any> {
    // Get all income transactions for the period
    const incomeTransactions = await this.transactionRepository.find({
      where: {
        propertyId,
        type: In([TransactionType.RENT_PAYMENT, TransactionType.DEPOSIT, TransactionType.OTHER]),
        status: TransactionStatus.COMPLETED,
        processedAt: Between(startDate, endDate),
      },
    });

    // Get all expense transactions for the period
    const expenseTransactions = await this.transactionRepository.find({
      where: {
        propertyId,
        type: In([TransactionType.MAINTENANCE_FEE, TransactionType.UTILITY_PAYMENT, TransactionType.INSURANCE_PAYMENT, TransactionType.OTHER]),
        status: TransactionStatus.COMPLETED,
        processedAt: Between(startDate, endDate),
      },
    });

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    return {
      period: { startDate, endDate },
      income: {
        total: totalIncome,
        transactions: incomeTransactions,
      },
      expenses: {
        total: totalExpenses,
        transactions: expenseTransactions,
      },
      netIncome,
    };
  }

  async getFinancialSummary(propertyId?: string): Promise<any> {
    const whereClause = propertyId ? { propertyId } : {};

    const [totalIncome, totalExpenses, pendingTransactions, overdueInvoices] = await Promise.all([
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type IN (:...types)', { 
          types: [TransactionType.RENT_PAYMENT, TransactionType.DEPOSIT, TransactionType.OTHER] 
        })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .andWhere(propertyId ? 'transaction.propertyId = :propertyId' : '1=1', { propertyId })
        .getRawOne(),
      
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type IN (:...types)', { 
          types: [TransactionType.MAINTENANCE_FEE, TransactionType.UTILITY_PAYMENT, TransactionType.INSURANCE_PAYMENT, TransactionType.OTHER] 
        })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .andWhere(propertyId ? 'transaction.propertyId = :propertyId' : '1=1', { propertyId })
        .getRawOne(),
      
      this.transactionRepository.count({
        where: {
          ...whereClause,
          status: TransactionStatus.PENDING,
        },
      }),
      
      this.findOverdueInvoices(),
    ]);

    return {
      totalIncome: parseFloat(totalIncome?.total || '0'),
      totalExpenses: parseFloat(totalExpenses?.total || '0'),
      netIncome: parseFloat(totalIncome?.total || '0') - parseFloat(totalExpenses?.total || '0'),
      pendingTransactions,
      overdueInvoices: overdueInvoices.length,
    };
  }
}
