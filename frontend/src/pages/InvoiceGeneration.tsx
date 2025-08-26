import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { showToast } from '../utils/toast';
import {
  FileText,
  Plus,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  Banknote,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Mail,
  Printer,
  Copy,
  Calculator,
  Receipt,
  CreditCard,
  PoundSterling
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  propertyAddress?: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string;
  paymentTerms: string;
  createdDate: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  items: Omit<InvoiceItem, 'id' | 'total'>[];
  paymentTerms: string;
  notes?: string;
}

const InvoiceGeneration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'create' | 'templates' | 'analytics'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      clientName: 'John Smith',
      clientEmail: 'john.smith@email.com',
      clientAddress: '123 High Street, London, SW1A 1AA',
      propertyAddress: '456 Queen Street, London, SW1A 2BB',
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      status: 'sent',
      items: [
        {
          id: '1',
          description: 'Property Management Fee - January 2024',
          quantity: 1,
          unitPrice: 150,
          total: 150
        },
        {
          id: '2',
          description: 'Maintenance Coordination',
          quantity: 2,
          unitPrice: 75,
          total: 150
        }
      ],
      subtotal: 300,
      vatRate: 20,
      vatAmount: 60,
      total: 360,
      paymentTerms: 'Payment due within 30 days',
      notes: 'Thank you for your business',
      createdDate: '2024-01-15'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah.johnson@email.com',
      clientAddress: '789 King Street, Manchester, M1 1AA',
      propertyAddress: '321 Market Street, Manchester, M1 2BB',
      issueDate: '2024-01-18',
      dueDate: '2024-02-17',
      status: 'paid',
      items: [
        {
          id: '1',
          description: 'Tenant Referencing Service',
          quantity: 3,
          unitPrice: 50,
          total: 150
        }
      ],
      subtotal: 150,
      vatRate: 20,
      vatAmount: 30,
      total: 180,
      paymentTerms: 'Payment due within 30 days',
      createdDate: '2024-01-18'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Mike Wilson',
      clientEmail: 'mike.wilson@email.com',
      clientAddress: '456 Church Lane, Birmingham, B1 1AA',
      issueDate: '2024-01-10',
      dueDate: '2024-02-09',
      status: 'overdue',
      items: [
        {
          id: '1',
          description: 'Property Valuation Report',
          quantity: 1,
          unitPrice: 200,
          total: 200
        }
      ],
      subtotal: 200,
      vatRate: 20,
      vatAmount: 40,
      total: 240,
      paymentTerms: 'Payment due within 30 days',
      createdDate: '2024-01-10'
    }
  ]);

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Property Management Monthly',
      description: 'Standard monthly property management fee',
      items: [
        {
          description: 'Property Management Fee',
          quantity: 1,
          unitPrice: 150
        }
      ],
      paymentTerms: 'Payment due within 30 days',
      notes: 'Monthly management fee for property services'
    },
    {
      id: '2',
      name: 'Tenant Referencing',
      description: 'Tenant background check and referencing',
      items: [
        {
          description: 'Tenant Referencing Service',
          quantity: 1,
          unitPrice: 50
        },
        {
          description: 'Credit Check',
          quantity: 1,
          unitPrice: 25
        }
      ],
      paymentTerms: 'Payment due within 14 days',
      notes: 'Comprehensive tenant screening service'
    }
  ]);

  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    propertyAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }],
    vatRate: 20,
    paymentTerms: 'Payment due within 30 days',
    notes: ''
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'sent': return Mail;
      case 'draft': return Edit;
      case 'overdue': return AlertCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const calculateInvoiceTotal = (items: InvoiceItem[], vatRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = (subtotal * vatRate) / 100;
    return {
      subtotal,
      vatAmount,
      total: subtotal + vatAmount
    };
  };

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setNewInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const updateInvoiceItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items?.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeInvoiceItem = (itemId: string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId)
    }));
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.clientName || !newInvoice.clientEmail || !newInvoice.items?.length) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const { subtotal, vatAmount, total } = calculateInvoiceTotal(
      newInvoice.items || [],
      newInvoice.vatRate || 20
    );

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      clientName: newInvoice.clientName!,
      clientEmail: newInvoice.clientEmail!,
      clientAddress: newInvoice.clientAddress || '',
      propertyAddress: newInvoice.propertyAddress,
      issueDate: newInvoice.issueDate!,
      dueDate: newInvoice.dueDate!,
      status: 'draft',
      items: newInvoice.items!,
      subtotal,
      vatRate: newInvoice.vatRate || 20,
      vatAmount,
      total,
      paymentTerms: newInvoice.paymentTerms!,
      notes: newInvoice.notes,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setInvoices(prev => [...prev, invoice]);
    setNewInvoice({
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      propertyAddress: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [{
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }],
      vatRate: 20,
      paymentTerms: 'Payment due within 30 days',
      notes: ''
    });
    showToast('Invoice created successfully', 'success');
    setActiveTab('invoices');
  };

  const handleUseTemplate = (template: Template) => {
    const items = template.items.map((item, index) => ({
      id: (index + 1).toString(),
      ...item,
      total: item.quantity * item.unitPrice
    }));

    setNewInvoice(prev => ({
      ...prev,
      items,
      paymentTerms: template.paymentTerms,
      notes: template.notes
    }));
    setActiveTab('create');
    showToast('Template applied successfully', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Generation</h1>
        <p className="text-gray-600">Create, manage, and track your invoices and financial documents</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'create', label: 'Create Invoice', icon: Plus },
            { id: 'templates', label: 'Templates', icon: Copy },
            { id: 'analytics', label: 'Analytics', icon: Calculator }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Invoices ({invoices.length})</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button onClick={() => setActiveTab('create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredInvoices.map((invoice) => {
              const StatusIcon = getStatusIcon(invoice.status);
              return (
                <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                        <p className="text-gray-600 mt-1">{invoice.clientName}</p>
                        {invoice.propertyAddress && (
                          <p className="text-sm text-gray-500 mt-1">{invoice.propertyAddress}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                          getStatusColor(invoice.status)
                        }`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="capitalize">{invoice.status}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">£{invoice.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Issued: {invoice.issueDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Due: {invoice.dueDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Receipt className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{invoice.items.length} item(s)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Send className="w-4 h-4 mr-2" />
                          Send Invoice
                        </Button>
                      )}
                      {invoice.status === 'sent' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Paid
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Invoice Tab */}
      {activeTab === 'create' && (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
              <p className="text-gray-600">Generate a professional invoice for your services</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Client Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                      <Input
                        value={newInvoice.clientName || ''}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Enter client name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client Email *</label>
                      <Input
                        type="email"
                        value={newInvoice.clientEmail || ''}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="Enter client email"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client Address</label>
                      <Input
                        value={newInvoice.clientAddress || ''}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, clientAddress: e.target.value }))}
                        placeholder="Enter client address"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Address (Optional)</label>
                      <Input
                        value={newInvoice.propertyAddress || ''}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, propertyAddress: e.target.value }))}
                        placeholder="Enter property address if applicable"
                      />
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date *</label>
                      <Input
                        type="date"
                        value={newInvoice.issueDate || ''}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, issueDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                      <Input
                        type="date"
                        value={newInvoice.dueDate || ''}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
                    <Button onClick={addInvoiceItem} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {newInvoice.items?.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                        <div className="col-span-12 md:col-span-5">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                            placeholder="Enter item description"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Qty</label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            min="1"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            min="0"
                          />
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
                          <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm font-medium">
                            £{item.total.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-1">
                          {newInvoice.items && newInvoice.items.length > 1 && (
                            <Button
                              onClick={() => removeInvoiceItem(item.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoice Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Summary</h3>
                  <div className="space-y-2">
                    {(() => {
                      const { subtotal, vatAmount, total } = calculateInvoiceTotal(
                        newInvoice.items || [],
                        newInvoice.vatRate || 20
                      );
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>£{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>VAT ({newInvoice.vatRate}%):</span>
                            <span>£{vatAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span>£{total.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                      <Input
                        value={newInvoice.paymentTerms || ''}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, paymentTerms: e.target.value }))}
                        placeholder="Enter payment terms"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={newInvoice.notes || ''}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Enter any additional notes"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={handleCreateInvoice} className="bg-blue-600 hover:bg-blue-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('invoices')}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Invoice Templates</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {template.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.description}</span>
                        <span>£{(item.quantity * item.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      £{invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                    </p>
                  </div>
                  <PoundSterling className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Outstanding</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      £{invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">
                      £{invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['paid', 'sent', 'draft', 'overdue', 'cancelled'].map(status => {
                    const count = invoices.filter(i => i.status === status).length;
                    const percentage = invoices.length > 0 ? (count / invoices.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{status}</span>
                          <span>{count} invoices</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status === 'paid' ? 'bg-green-600' :
                              status === 'sent' ? 'bg-blue-600' :
                              status === 'draft' ? 'bg-gray-600' :
                              status === 'overdue' ? 'bg-red-600' :
                              'bg-red-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices
                    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
                    .slice(0, 5)
                    .map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-600">{invoice.clientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£{invoice.total.toFixed(2)}</p>
                          <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceGeneration;