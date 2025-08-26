import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Mail,
  Phone,
  Calendar,
  Banknote,
  Eye,
  MousePointer,
  UserPlus,
  Building
} from 'lucide-react';

interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<any>;
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'contact' | 'campaign' | 'deal';
  description: string;
  time: string;
  status: 'success' | 'pending' | 'warning';
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

const CrmDashboard: React.FC = () => {
  const metrics: DashboardMetric[] = [
    {
      title: 'Total Leads',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: Target
    },
    {
      title: 'Active Contacts',
      value: '856',
      change: '+8.2%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Campaigns',
      value: '24',
      change: '+3.1%',
      trend: 'up',
      icon: Mail
    },
    {
      title: 'Revenue',
      value: '£125,430',
      change: '-2.4%',
      trend: 'down',
      icon: Banknote
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'lead',
      description: 'New lead from website contact form',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'campaign',
      description: 'Email campaign "Summer Properties" sent to 500 contacts',
      time: '15 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'contact',
      description: 'Contact updated: John Smith - Added phone number',
      time: '1 hour ago',
      status: 'pending'
    },
    {
      id: '4',
      type: 'deal',
      description: 'Deal closed: £45,000 - Property sale commission',
      time: '2 hours ago',
      status: 'success'
    }
  ];

  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Summer Property Showcase',
      status: 'active',
      sent: 1250,
      opened: 850,
      clicked: 127,
      openRate: 68.0,
      clickRate: 14.9
    },
    {
      id: '2',
      name: 'New Listings Alert',
      status: 'active',
      sent: 890,
      opened: 623,
      clicked: 89,
      openRate: 70.0,
      clickRate: 14.3
    },
    {
      id: '3',
      name: 'Market Update Newsletter',
      status: 'completed',
      sent: 2100,
      opened: 1470,
      clicked: 294,
      openRate: 70.0,
      clickRate: 20.0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'warning':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead':
        return Target;
      case 'contact':
        return Users;
      case 'campaign':
        return Mail;
      case 'deal':
        return Banknote;
      default:
        return Calendar;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center mt-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-gray-400 mt-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Sent: {campaign.sent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Opened: {campaign.opened.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MousePointer className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Clicked: {campaign.clicked.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">CTR: {campaign.clickRate}%</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Open Rate</span>
                      <span>{campaign.openRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${campaign.openRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
              <UserPlus className="w-6 h-6" />
              <span className="text-sm">Add Lead</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
              <Users className="w-6 h-6" />
              <span className="text-sm">Add Contact</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
              <Mail className="w-6 h-6" />
              <span className="text-sm">Send Campaign</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
              <Phone className="w-6 h-6" />
              <span className="text-sm">Schedule Call</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
              <Building className="w-6 h-6" />
              <span className="text-sm">Add Property</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Book Meeting</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmDashboard;