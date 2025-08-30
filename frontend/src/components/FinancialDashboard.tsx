import React, { useState, useEffect } from 'react';
import { 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  FileText, 
  CreditCard, 
  Calendar, 
  Download, 
  Upload, 
  Plus, 
  Filter, 
  Search,
  Eye,
  Edit,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Receipt,
  X
} from 'lucide-react';
import { 
  financialService, 
  Transaction, 
  Invoice, 
  FinancialReport, 
  FinancialFilters,
  PaymentMethod,
  BudgetCategory
} from '../services/financialService';
import { toast } from 'sonner';
import { formatCurrency } from '../utils';

interface FinancialDashboardProps {
  userRole: 'admin' | 'agent' | 'landlord' | 'tenant';
  userId: string;
}

type ViewMode = 'overview' | 'transactions' | 'invoices' | 'reports' | 'budget';

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  userRole,
  userId
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FinancialFilters>({
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Load financial data
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await financialService.getTransactions(
        filters,
        pagination.page,
        pagination.limit
      );
      setTransactions(response.transactions);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        pages: response.pages
      }));
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await financialService.getInvoices(
        {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        },
        1,
        50
      );
      setInvoices(response.invoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    }
  };

  const loadFinancialReport = async () => {
    try {
      const reportData = await financialService.getFinancialReport(
        filters.dateFrom || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        filters.dateTo || new Date().toISOString().split('T')[0]
      );
      setReport(reportData);
    } catch (error) {
      console.error('Error loading financial report:', error);
      toast.error('Failed to load financial report');
    }
  };

  const loadBudgetCategories = async () => {
    try {
      const categories = await financialService.getBudgetCategories('monthly');
      setBudgetCategories(categories);
    } catch (error) {
      console.error('Error loading budget categories:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await financialService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  // Handle transaction operations
  const handleCreateTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction = await financialService.createTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      setShowTransactionModal(false);
      toast.success('Transaction created successfully');
      loadFinancialReport(); // Refresh report
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Failed to create transaction');
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await financialService.updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      toast.success('Transaction updated successfully');
      loadFinancialReport();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await financialService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted successfully');
      loadFinancialReport();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  // Handle invoice operations
  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newInvoice = await financialService.createInvoice(invoiceData);
      setInvoices(prev => [newInvoice, ...prev]);
      setShowInvoiceModal(false);
      toast.success('Invoice created successfully');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const handleSendInvoice = async (id: string) => {
    try {
      await financialService.sendInvoice(id);
      setInvoices(prev => prev.map(inv => 
        inv.id === id ? { ...inv, status: 'sent' as const } : inv
      ));
      toast.success('Invoice sent successfully');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  const handleMarkInvoiceAsPaid = async (id: string) => {
    try {
      const updatedInvoice = await financialService.markInvoiceAsPaid(
        id,
        new Date().toISOString().split('T')[0],
        'bank_transfer'
      );
      setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
      toast.success('Invoice marked as paid');
      loadFinancialReport();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
    }
  };

  // Handle file upload
  const handleReceiptUpload = async (transactionId: string, file: File) => {
    try {
      const receiptUrl = await financialService.uploadTransactionReceipt(transactionId, file);
      setTransactions(prev => prev.map(t => 
        t.id === transactionId ? { ...t, receiptUrl } : t
      ));
      toast.success('Receipt uploaded successfully');
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('Failed to upload receipt');
    }
  };

  // Export data
  const handleExport = async (type: 'transactions' | 'invoices' | 'report', format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await financialService.exportFinancialData(format, type, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${type} exported successfully`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  useEffect(() => {
    loadTransactions();
    loadInvoices();
    loadFinancialReport();
    loadBudgetCategories();
    loadPaymentMethods();
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': case 'sent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': case 'sent': return <Clock className="h-4 w-4" />;
      case 'cancelled': case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['overview', 'transactions', 'invoices', 'reports', 'budget'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${
                    viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            
            <button
              onClick={() => handleExport(viewMode === 'invoices' ? 'invoices' : 'transactions', 'excel')}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            
            {viewMode === 'transactions' && (
              <button
                onClick={() => setShowTransactionModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </button>
            )}
            
            {viewMode === 'invoices' && (
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Invoice
              </button>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        {report && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Total Income</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(report.summary.totalIncome)}
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-600">Total Expenses</span>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {formatCurrency(report.summary.totalExpenses)}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Net Profit</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(report.summary.netProfit)}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Profit Margin</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {report.summary.profitMargin.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Outstanding</span>
              </div>
              <div className="text-2xl font-bold text-yellow-700">
                {report.summary.outstandingInvoices}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type?.join(',') || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  type: e.target.value ? e.target.value.split(',') as ('income' | 'expense')[] : undefined
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                value={filters.category?.join(',') || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  category: e.target.value ? e.target.value.split(',') : undefined
                }))}
                placeholder="Enter categories"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                loadTransactions();
                loadInvoices();
                loadFinancialReport();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'overview' && report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income by Category */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Category</h3>
            <div className="space-y-3">
              {report.incomeByCategory.map(item => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Expenses by Category */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
            <div className="space-y-3">
              {report.expensesByCategory.map(item => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <div className="space-y-4">
              {report.monthlyTrends.map(trend => (
                <div key={trend.month} className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Month</div>
                    <div className="font-medium">{trend.month}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Income</div>
                    <div className="font-medium text-green-600">{formatCurrency(trend.income)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Expenses</div>
                    <div className="font-medium text-red-600">{formatCurrency(trend.expenses)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Profit</div>
                    <div className={`font-medium ${
                      trend.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(trend.profit)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'transactions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            ) : (
              <div className="space-y-3">
                {transactions
                  .filter(transaction => 
                    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(transaction => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                            transaction.type === 'income' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {transaction.type === 'income' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                            getStatusColor(transaction.status)
                          }`}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">{transaction.category}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <div className="font-medium text-gray-900">{transaction.description}</div>
                            <div className="text-sm text-gray-600">{transaction.date}</div>
                          </div>
                          
                          <div>
                            <div className={`text-lg font-bold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                            {transaction.vatAmount && (
                              <div className="text-sm text-gray-600">
                                VAT: {formatCurrency(transaction.vatAmount)}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            {transaction.paymentMethod && (
                              <div className="text-sm text-gray-600">
                                <CreditCard className="h-4 w-4 inline mr-1" />
                                {transaction.paymentMethod}
                              </div>
                            )}
                            {transaction.reference && (
                              <div className="text-sm text-gray-600">
                                Ref: {transaction.reference}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            {transaction.tags && transaction.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {transaction.tags.map(tag => (
                                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {transaction.receiptUrl ? (
                          <a
                            href={transaction.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Receipt"
                          >
                            <Receipt className="h-4 w-4" />
                          </a>
                        ) : (
                          <label className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Upload Receipt">
                            <Upload className="h-4 w-4" />
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleReceiptUpload(transaction.id, file);
                                }
                              }}
                            />
                          </label>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowTransactionModal(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-lg">
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'invoices' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoices</h3>
            
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No invoices found
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">#{invoice.invoiceNumber}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                            getStatusColor(invoice.status)
                          }`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">{invoice.type.replace('_', ' ')}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">To</div>
                            <div className="font-medium text-gray-900">{invoice.toEntity.name}</div>
                            <div className="text-sm text-gray-600">{invoice.toEntity.email}</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-600">Amount</div>
                            <div className="text-lg font-bold text-gray-900">{formatCurrency(invoice.total)}</div>
                            {invoice.vatAmount > 0 && (
                              <div className="text-sm text-gray-600">VAT: {formatCurrency(invoice.vatAmount)}</div>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-600">Issue Date</div>
                            <div className="text-sm text-gray-900">{invoice.issueDate}</div>
                            <div className="text-sm text-gray-600">Due: {invoice.dueDate}</div>
                          </div>
                          
                          <div>
                            {invoice.paidDate && (
                              <>
                                <div className="text-sm text-gray-600">Paid Date</div>
                                <div className="text-sm text-green-600">{invoice.paidDate}</div>
                              </>
                            )}
                            {invoice.remindersSent > 0 && (
                              <div className="text-sm text-yellow-600">
                                {invoice.remindersSent} reminder(s) sent
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceModal(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => handleSendInvoice(invoice.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send Invoice"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <button
                            onClick={() => handleMarkInvoiceAsPaid(invoice.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={async () => {
                            try {
                              const blob = await financialService.generateInvoicePDF(invoice.id);
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `invoice-${invoice.invoiceNumber}.pdf`;
                              a.click();
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              toast.error('Failed to download invoice');
                            }
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'budget' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual</h3>
            
            {budgetCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No budget categories found
              </div>
            ) : (
              <div className="space-y-4">
                {budgetCategories.map(category => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          category.variance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.variance >= 0 ? '+' : ''}{formatCurrency(category.variance)}
                        </div>
                        <div className={`text-sm ${
                          category.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.variancePercentage >= 0 ? '+' : ''}{category.variancePercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budgeted</span>
                        <span className="font-medium">{formatCurrency(category.budgetedAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Actual</span>
                        <span className="font-medium">{formatCurrency(category.actualAmount)}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            category.actualAmount <= category.budgetedAmount ? 'bg-green-600' : 'bg-red-600'
                          }`}
                          style={{ 
                            width: `${Math.min((category.actualAmount / category.budgetedAmount) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
                <button
                  onClick={() => {
                    setShowTransactionModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Transaction form would go here */}
              <div className="text-center py-8 text-gray-500">
                Transaction form implementation needed
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedInvoice ? 'Invoice Details' : 'Create Invoice'}
                </h3>
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setSelectedInvoice(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Invoice form would go here */}
              <div className="text-center py-8 text-gray-500">
                Invoice form implementation needed
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;