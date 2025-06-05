
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, FileText, Download } from 'lucide-react';

const BillingOverview = () => {
  const [timePeriod, setTimePeriod] = useState('30d');

  const revenueData = [
    { month: 'Jan', revenue: 1245.67, tasks: 456 },
    { month: 'Feb', revenue: 1389.23, tasks: 512 },
    { month: 'Mar', revenue: 1567.89, tasks: 623 },
    { month: 'Apr', revenue: 1456.78, tasks: 567 },
    { month: 'May', revenue: 1789.34, tasks: 712 },
    { month: 'Jun', revenue: 2456.78, tasks: 847 }
  ];

  const protocolRevenue = [
    { name: 'NLWeb', value: 45.2, revenue: 1110.56, color: '#60A5FA' },
    { name: 'MCP', value: 32.1, revenue: 788.58, color: '#A78BFA' },
    { name: 'A2A', value: 22.7, revenue: 557.64, color: '#34D399' }
  ];

  const agentRevenue = [
    {
      agent: 'ImageProcessor X',
      revenue: 412.89,
      tasks: 203,
      avgRate: 2.03,
      protocol: 'NLWeb',
      efficiency: 98.1
    },
    {
      agent: 'CodeGenerator Bot',
      revenue: 298.12,
      tasks: 156,
      avgRate: 1.91,
      protocol: 'A2A',
      efficiency: 91.5
    },
    {
      agent: 'DataMiner Pro',
      revenue: 245.67,
      tasks: 127,
      avgRate: 1.93,
      protocol: 'NLWeb',
      efficiency: 96.8
    },
    {
      agent: 'TextAnalyzer AI',
      revenue: 189.34,
      tasks: 89,
      avgRate: 2.13,
      protocol: 'MCP',
      efficiency: 94.2
    }
  ];

  const billingMetrics = [
    { label: 'Total Revenue', value: '$2,456.78', change: '+12.5%', trend: 'up' },
    { label: 'Tasks Completed', value: '1,847', change: '+8.3%', trend: 'up' },
    { label: 'Avg Rate/Task', value: '$1.33', change: '+2.1%', trend: 'up' },
    { label: 'Active Subscriptions', value: '23', change: '+4', trend: 'up' }
  ];

  const recentTransactions = [
    {
      id: 'TX-001',
      timestamp: '2024-01-15 14:32:15',
      agent: 'ImageProcessor X',
      task: 'Image classification batch',
      amount: 15.67,
      protocol: 'NLWeb',
      status: 'Completed'
    },
    {
      id: 'TX-002',
      timestamp: '2024-01-15 14:28:45',
      agent: 'TextAnalyzer AI',
      task: 'Sentiment analysis',
      amount: 8.92,
      protocol: 'MCP',
      status: 'Completed'
    },
    {
      id: 'TX-003',
      timestamp: '2024-01-15 14:25:12',
      agent: 'CodeGenerator Bot',
      task: 'API documentation',
      amount: 23.45,
      protocol: 'A2A',
      status: 'Pending'
    },
    {
      id: 'TX-004',
      timestamp: '2024-01-15 14:21:38',
      agent: 'DataMiner Pro',
      task: 'Data extraction',
      amount: 12.34,
      protocol: 'NLWeb',
      status: 'Completed'
    }
  ];

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'NLWeb': return 'bg-blue-500/20 text-blue-400';
      case 'MCP': return 'bg-purple-500/20 text-purple-400';
      case 'A2A': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-400 border-green-400';
      case 'Pending': return 'text-yellow-400 border-yellow-400';
      case 'Failed': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {billingMetrics.map((metric) => (
          <Card key={metric.label} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{metric.label}</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <p className="text-xs text-green-400 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trend</CardTitle>
            <CardDescription className="text-slate-400">
              Monthly revenue and task completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563', 
                    borderRadius: '8px' 
                  }} 
                />
                <Bar dataKey="revenue" fill="#60A5FA" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Revenue by Protocol</CardTitle>
            <CardDescription className="text-slate-400">
              Distribution across communication protocols
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={protocolRevenue}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {protocolRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563', 
                    borderRadius: '8px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Agent Revenue Performance</CardTitle>
          <CardDescription className="text-slate-400">
            Individual agent contribution to revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentRevenue.map((agent, index) => (
              <div key={index} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-semibold text-white">{agent.agent}</div>
                      <div className="text-xs text-slate-400">{agent.tasks} tasks completed</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getProtocolColor(agent.protocol)}>
                      {agent.protocol}
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">${agent.revenue.toFixed(2)}</div>
                      <div className="text-xs text-slate-400">${agent.avgRate.toFixed(2)}/task</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Efficiency</span>
                    <span className="text-white">{agent.efficiency}%</span>
                  </div>
                  <Progress value={agent.efficiency} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-slate-400">
              Latest billable agent activities
            </CardDescription>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-medium text-white text-sm">{transaction.task}</div>
                    <div className="text-xs text-slate-400">
                      {transaction.agent} • {transaction.timestamp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getProtocolColor(transaction.protocol)}>
                    {transaction.protocol}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                  <div className="text-right">
                    <div className="font-semibold text-white">${transaction.amount.toFixed(2)}</div>
                    <div className="text-xs text-slate-400">{transaction.id}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingOverview;
