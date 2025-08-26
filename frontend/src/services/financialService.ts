import { apiService } from './api';

// Financial interfaces
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  amount: number;
  currency: 'GBP';
  description: string;
  date: string;
  propertyId?: string;
  tenantId?: string;
  landlordId?: string;
  agentId?: string;
  invoiceId?: string;
  receiptUrl?: string;
  vatAmount?: number;
  vatRate?: number;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextDueDate?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'overdue';
  paymentMethod?: string;
  reference?: string;
  tags?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'rent' | 'service_charge' | 'deposit' | 'commission' | 'maintenance' | 'other';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  fromEntity: {
    id: string;
    name: string;
    email: string;
    address: string;
    vatNumber?: string;
  };
  toEntity: {
    id: string;
    name: string;
    email: string;
    address: string;
    vatNumber?: string;
  };
  propertyId?: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  currency: 'GBP';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentTerms: string;
  notes?: string;
  attachments?: string[];
  paymentLink?: string;
  remindersSent: number;
  lastReminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface FinancialReport {
  period: {
    from: string;
    to: string;
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    vatOwed: number;
    outstandingInvoices: number;
    overdueInvoices: number;
  };
  incomeByCategory: CategoryBreakdown[];
  expensesByCategory: CategoryBreakdown[];
  monthlyTrends: MonthlyTrend[];
  topProperties: PropertyFinancial[];
  cashFlow: CashFlowData[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface PropertyFinancial {
  propertyId: string;
  address: string;
  income: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  occupancyRate: number;
}

export interface CashFlowData {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

export interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'card' | 'direct_debit' | 'cash' | 'cheque';
  name: string;
  details: Record<string, any>;
  isDefault: boolean;
  isActive: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  period: 'monthly' | 'quarterly' | 'annually';
}

export interface TaxReport {
  taxYear: string;
  totalIncome: number;
  totalExpenses: number;
  taxableProfit: number;
  vatCollected: number;
  vatPaid: number;
  vatOwed: number;
  allowableExpenses: CategoryBreakdown[];
  capitalAllowances: number;
  estimatedTax: number;
}

export interface FinancialFilters {
  type?: ('income' | 'expense')[];
  category?: string[];
  propertyId?: string[];
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  amountMin?: number;
  amountMax?: number;
  tags?: string[];
}

class FinancialService {
  // Transaction Management
  async getTransactions(
    filters?: FinancialFilters,
    page = 1,
    limit = 20
  ): Promise<{
    transactions: Transaction[];
    total: number;
    pages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await apiService.get(`/financial/transactions?${params}`);
    return response.data;
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiService.get(`/financial/transactions/${id}`);
    return response.data;
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const response = await apiService.post('/financial/transactions', transaction);
    return response.data;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const response = await apiService.put(`/financial/transactions/${id}`, updates);
    return response.data;
  }

  async deleteTransaction(id: string): Promise<void> {
    await apiService.delete(`/financial/transactions/${id}`);
  }

  async bulkCreateTransactions(transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Transaction[]> {
    const response = await apiService.post('/financial/transactions/bulk', { transactions });
    return response.data;
  }

  async uploadTransactionReceipt(transactionId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('receipt', file);
    
    const response = await apiService.post(`/financial/transactions/${transactionId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  }

  // Invoice Management
  async getInvoices(
    filters?: {
      status?: string[];
      type?: string[];
      propertyId?: string[];
      dateFrom?: string;
      dateTo?: string;
    },
    page = 1,
    limit = 20
  ): Promise<{
    invoices: Invoice[];
    total: number;
    pages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await apiService.get(`/financial/invoices?${params}`);
    return response.data;
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await apiService.get(`/financial/invoices/${id}`);
    return response.data;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const response = await apiService.post('/financial/invoices', invoice);
    return response.data;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const response = await apiService.put(`/financial/invoices/${id}`, updates);
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    await apiService.delete(`/financial/invoices/${id}`);
  }

  async sendInvoice(id: string, email?: string): Promise<void> {
    await apiService.post(`/financial/invoices/${id}/send`, { email });
  }

  async markInvoiceAsPaid(id: string, paymentDate: string, paymentMethod: string): Promise<Invoice> {
    const response = await apiService.post(`/financial/invoices/${id}/mark-paid`, {
      paymentDate,
      paymentMethod
    });
    return response.data;
  }

  async generateInvoicePDF(id: string): Promise<Blob> {
    const response = await apiService.get(`/financial/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async sendInvoiceReminder(id: string): Promise<void> {
    await apiService.post(`/financial/invoices/${id}/reminder`);
  }

  async createRecurringInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>, frequency: string): Promise<Invoice> {
    const response = await apiService.post('/financial/invoices/recurring', {
      ...invoiceData,
      frequency
    });
    return response.data;
  }

  // Financial Reporting
  async getFinancialReport(
    dateFrom: string,
    dateTo: string,
    propertyIds?: string[]
  ): Promise<FinancialReport> {
    const params = new URLSearchParams({
      dateFrom,
      dateTo
    });
    
    if (propertyIds?.length) {
      propertyIds.forEach(id => params.append('propertyIds', id));
    }

    const response = await apiService.get(`/financial/reports?${params}`);
    return response.data;
  }

  async getTaxReport(taxYear: string): Promise<TaxReport> {
    const response = await apiService.get(`/financial/tax-report/${taxYear}`);
    return response.data;
  }

  async getCashFlowForecast(
    months: number,
    propertyIds?: string[]
  ): Promise<CashFlowData[]> {
    const params = new URLSearchParams({
      months: months.toString()
    });
    
    if (propertyIds?.length) {
      propertyIds.forEach(id => params.append('propertyIds', id));
    }

    const response = await apiService.get(`/financial/cash-flow-forecast?${params}`);
    return response.data;
  }

  async getPropertyFinancials(
    propertyId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<PropertyFinancial> {
    const params = new URLSearchParams({
      dateFrom,
      dateTo
    });

    return await apiService.get<PropertyFinancial>(`/financial/properties/${propertyId}/financials?${params}`);
  }

  async exportFinancialData(
    format: 'csv' | 'excel' | 'pdf',
    type: 'transactions' | 'invoices' | 'report',
    filters?: any
  ): Promise<Blob> {
    return await apiService.post<Blob>('/financial/export', {
      format,
      type,
      filters
    }, {
      responseType: 'blob'
    });
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return await apiService.get<PaymentMethod[]>('/financial/payment-methods');
  }

  async createPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    return await apiService.post<PaymentMethod>('/financial/payment-methods', paymentMethod);
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    return await apiService.put<PaymentMethod>(`/financial/payment-methods/${id}`, updates);
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await apiService.delete(`/financial/payment-methods/${id}`);
  }

  async setDefaultPaymentMethod(id: string): Promise<void> {
    await apiService.post(`/financial/payment-methods/${id}/set-default`);
  }

  // Budget Management
  async getBudgetCategories(period: string): Promise<BudgetCategory[]> {
    return await apiService.get<BudgetCategory[]>(`/financial/budget?period=${period}`);
  }

  async updateBudgetCategory(id: string, budgetedAmount: number): Promise<BudgetCategory> {
    return await apiService.put<BudgetCategory>(`/financial/budget/${id}`, { budgetedAmount });
  }

  async createBudgetCategory(category: Omit<BudgetCategory, 'id' | 'actualAmount' | 'variance' | 'variancePercentage'>): Promise<BudgetCategory> {
    return await apiService.post<BudgetCategory>('/financial/budget', category);
  }

  // Analytics
  async getIncomeAnalytics(
    dateFrom: string,
    dateTo: string,
    groupBy: 'day' | 'week' | 'month' | 'quarter'
  ): Promise<{ date: string; amount: number }[]> {
    const params = new URLSearchParams({
      dateFrom,
      dateTo,
      groupBy
    });

    return await apiService.get<{ date: string; amount: number }[]>(`/financial/analytics/income?${params}`);
  }

  async getExpenseAnalytics(
    dateFrom: string,
    dateTo: string,
    groupBy: 'day' | 'week' | 'month' | 'quarter'
  ): Promise<{ date: string; amount: number }[]> {
    const params = new URLSearchParams({
      dateFrom,
      dateTo,
      groupBy
    });

    return await apiService.get<{ date: string; amount: number }[]>(`/financial/analytics/expenses?${params}`);
  }

  async getProfitLossStatement(
    dateFrom: string,
    dateTo: string,
    propertyIds?: string[]
  ): Promise<{
    revenue: CategoryBreakdown[];
    expenses: CategoryBreakdown[];
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
  }> {
    const params = new URLSearchParams({
      dateFrom,
      dateTo
    });
    
    if (propertyIds?.length) {
      propertyIds.forEach(id => params.append('propertyIds', id));
    }

    const response = await apiService.get(`/financial/profit-loss?${params}`);
    return response.data;
  }

  // Recurring Transactions
  async getRecurringTransactions(): Promise<Transaction[]> {
    return await apiService.get<Transaction[]>('/financial/transactions/recurring');
  }

  async createRecurringTransaction(
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    return await apiService.post<Transaction>('/financial/transactions/recurring', transaction);
  }

  async updateRecurringTransaction(
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    return await apiService.put<Transaction>(`/financial/transactions/recurring/${id}`, updates);
  }

  async pauseRecurringTransaction(id: string): Promise<void> {
    await apiService.post(`/financial/transactions/recurring/${id}/pause`);
  }

  async resumeRecurringTransaction(id: string): Promise<void> {
    await apiService.post(`/financial/transactions/recurring/${id}/resume`);
  }

  // Bank Integration
  async connectBankAccount(bankDetails: {
    bankName: string;
    accountNumber: string;
    sortCode: string;
    accountName: string;
  }): Promise<{ connectionId: string }> {
    return await apiService.post<{ connectionId: string }>('/financial/bank/connect', bankDetails);
  }

  async syncBankTransactions(connectionId: string): Promise<Transaction[]> {
    return await apiService.post<Transaction[]>(`/financial/bank/${connectionId}/sync`);
  }

  async getBankConnections(): Promise<{
    id: string;
    bankName: string;
    accountName: string;
    lastSync: string;
    status: 'connected' | 'disconnected' | 'error';
  }[]> {
    return await apiService.get<{
      id: string;
      bankName: string;
      accountName: string;
      lastSync: string;
      status: 'connected' | 'disconnected' | 'error';
    }[]>('/financial/bank/connections');
  }

  async disconnectBankAccount(connectionId: string): Promise<void> {
    await apiService.delete(`/financial/bank/connections/${connectionId}`);
  }

  // Financial Categories
  async getFinancialCategories(): Promise<{
    income: string[];
    expense: string[];
  }> {
    return await apiService.get<{
      income: string[];
      expense: string[];
    }>('/financial/categories');
  }

  async createFinancialCategory(
    type: 'income' | 'expense',
    name: string
  ): Promise<{ success: boolean; category: string }> {
    return await apiService.post<{ success: boolean; category: string }>('/financial/categories', { type, name });
  }

  async updateFinancialCategory(
    type: 'income' | 'expense',
    oldName: string,
    newName: string
  ): Promise<{ success: boolean }> {
    return await apiService.put<{ success: boolean }>(`/financial/categories/${type}/${oldName}`, { name: newName });
  }

  async deleteFinancialCategory(type: 'income' | 'expense', name: string): Promise<void> {
    await apiService.delete(`/financial/categories/${type}/${name}`);
  }
}

export const financialService = new FinancialService();