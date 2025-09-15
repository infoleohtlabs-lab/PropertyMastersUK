import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter, CreditCard, Receipt, PieChart } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types/auth';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  propertyId?: string;
  propertyTitle?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  monthlyRent: number;
  outstandingPayments: number;
  maintenanceCosts: number;
}

const DashboardFinancials: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('month');

  useEffect(() => {
    // Simulate API call
    const fetchFinancialData = async () => {
      setLoading(true);
      
      // Mock transactions
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          category: 'Rent',
          description: 'Monthly rent payment',
          amount: 2500,
          date: '2024-01-01',
          propertyId: '1',
          propertyTitle: 'Modern 2-Bed Apartment',
          status: 'completed'
        },
        {
          id: '2',
          type: 'income',
          category: 'Rent',
          description: 'Monthly rent payment',
          amount: 1800,
          date: '2024-01-01',
          propertyId: '2',
          propertyTitle: 'Victorian Terrace House',
          status: 'completed'
        },
        {
          id: '3',
          type: 'expense',
          category: 'Maintenance',
          description: 'Plumbing repair',
          amount: 350,
          date: '2024-01-15',
          propertyId: '3',
          propertyTitle: 'Studio Flat City Center',
          status: 'completed'
        },
        {
          id: '4',
          type: 'expense',
          category: 'Insurance',
          description: 'Property insurance premium',
          amount: 120,
          date: '2024-01-10',
          status: 'completed'
        },
        {
          id: '5',
          type: 'income',
          category: 'Deposit',
          description: 'Security deposit',
          amount: 2500,
          date: '2024-01-20',
          propertyId: '1',
          propertyTitle: 'Modern 2-Bed Apartment',
          status: 'pending'
        },
        {
          id: '6',
          type: 'expense',
          category: 'Management',
          description: 'Property management fee',
          amount: 200,
          date: '2024-01-25',
          status: 'completed'
        }
      ];

      // Mock summary
      const mockSummary: FinancialSummary = {
        totalIncome: 6800,
        totalExpenses: 670,
        netProfit: 6130,
        monthlyRent: 4300,
        outstandingPayments: 2500,
        maintenanceCosts: 350
      };

      setTransactions(mockTransactions);
      setSummary(mockSummary);
      setLoading(false);
    };

    fetchFinancialData();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    return matchesType && matchesCategory;
  });

  const getTransactionIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'rent': return <DollarSign className="h-4 w-4" />;
      case 'maintenance': return <Receipt className="h-4 w-4" />;
      case 'insurance': return <CreditCard className="h-4 w-4" />;
      case 'deposit': return <DollarSign className="h-4 w-4" />;
      case 'management': return <Receipt className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canViewFinancials = user?.role === UserRole.ADMIN || user?.role === UserRole.AGENT || user?.role === UserRole.LANDLORD;

  if (!canViewFinancials) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Access denied</div>
        <p className="text-sm text-gray-400">You don't have permission to view financial data.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600">Track income, expenses, and profitability</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-semibold text-green-600">£{summary.totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12.5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-semibold text-red-600">£{summary.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500">+8.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-semibold text-blue-600">£{summary.netProfit.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+15.3%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                <p className="text-2xl font-semibold text-gray-900">£{summary.monthlyRent.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Recurring monthly income</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-semibold text-yellow-600">£{summary.outstandingPayments.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Pending payments</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-semibold text-orange-600">£{summary.maintenanceCosts.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Receipt className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">This month's costs</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="Rent">Rent</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Insurance">Insurance</option>
          <option value="Deposit">Deposit</option>
          <option value="Management">Management</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <div className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {getTransactionIcon(transaction.category)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{transaction.category}</span>
                      {transaction.propertyTitle && (
                        <>
                          <span>•</span>
                          <span>{transaction.propertyTitle}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                  <span className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}£{transaction.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-4">No transactions found</div>
          <p className="text-sm text-gray-400">Try adjusting your filters or date range.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardFinancials;