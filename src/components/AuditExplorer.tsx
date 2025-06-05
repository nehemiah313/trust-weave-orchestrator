
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, Download, Eye, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

const AuditExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>();

  const auditLogs = [
    {
      id: 'AUD-001',
      timestamp: '2024-01-15 14:32:15',
      agent: 'DataMiner Pro',
      action: 'Task Delegation',
      protocol: 'NLWeb',
      status: 'Success',
      details: 'Data extraction task delegated to external API',
      trustImpact: '+0.1',
      user: 'system',
      taskId: 'T-2024-001'
    },
    {
      id: 'AUD-002',
      timestamp: '2024-01-15 14:31:48',
      agent: 'ImageProcessor X',
      action: 'Authentication',
      protocol: 'A2A',
      status: 'Success',
      details: 'Agent-to-agent authentication completed',
      trustImpact: '0.0',
      user: 'admin',
      taskId: 'T-2024-002'
    },
    {
      id: 'AUD-003',
      timestamp: '2024-01-15 14:30:22',
      agent: 'TextAnalyzer AI',
      action: 'Trust Violation',
      protocol: 'MCP',
      status: 'Warning',
      details: 'Response time exceeded threshold (5.2s > 5.0s)',
      trustImpact: '-0.3',
      user: 'system',
      taskId: 'T-2024-003'
    },
    {
      id: 'AUD-004',
      timestamp: '2024-01-15 14:29:55',
      agent: 'CodeGenerator Bot',
      action: 'Task Execution',
      protocol: 'A2A',
      status: 'Failed',
      details: 'Code generation failed due to invalid input parameters',
      trustImpact: '-0.5',
      user: 'developer',
      taskId: 'T-2024-004'
    },
    {
      id: 'AUD-005',
      timestamp: '2024-01-15 14:28:11',
      agent: 'DataMiner Pro',
      action: 'Data Access',
      protocol: 'NLWeb',
      status: 'Success',
      details: 'Accessed customer database with proper authorization',
      trustImpact: '+0.2',
      user: 'analyst',
      taskId: 'T-2024-005'
    }
  ];

  const complianceMetrics = [
    { metric: 'Data Privacy Compliance', score: 98.5, status: 'Excellent' },
    { metric: 'Access Control Adherence', score: 96.2, status: 'Good' },
    { metric: 'Audit Trail Completeness', score: 99.1, status: 'Excellent' },
    { metric: 'Trust Policy Violations', score: 91.7, status: 'Good' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'Failed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'text-green-400 border-green-400';
      case 'Warning': return 'text-yellow-400 border-yellow-400';
      case 'Failed': return 'text-red-400 border-red-400';
      default: return 'text-blue-400 border-blue-400';
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'NLWeb': return 'bg-blue-500/20 text-blue-400';
      case 'MCP': return 'bg-purple-500/20 text-purple-400';
      case 'A2A': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTrustImpactColor = (impact: string) => {
    if (impact.startsWith('+')) return 'text-green-400';
    if (impact.startsWith('-')) return 'text-red-400';
    return 'text-gray-400';
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.taskId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgent = selectedAgent === 'all' || log.agent === selectedAgent;
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    return matchesSearch && matchesAgent && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Audit Log Filters</CardTitle>
          <CardDescription className="text-slate-400">
            Search and filter audit trail entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="pl-10 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-white">All Agents</SelectItem>
                <SelectItem value="DataMiner Pro" className="text-white">DataMiner Pro</SelectItem>
                <SelectItem value="TextAnalyzer AI" className="text-white">TextAnalyzer AI</SelectItem>
                <SelectItem value="CodeGenerator Bot" className="text-white">CodeGenerator Bot</SelectItem>
                <SelectItem value="ImageProcessor X" className="text-white">ImageProcessor X</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-white">All Actions</SelectItem>
                <SelectItem value="Task Delegation" className="text-white">Task Delegation</SelectItem>
                <SelectItem value="Authentication" className="text-white">Authentication</SelectItem>
                <SelectItem value="Trust Violation" className="text-white">Trust Violation</SelectItem>
                <SelectItem value="Task Execution" className="text-white">Task Execution</SelectItem>
                <SelectItem value="Data Access" className="text-white">Data Access</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {complianceMetrics.map((metric) => (
          <Card key={metric.metric} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white">{metric.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">{metric.score}%</div>
                <Badge variant="outline" className={
                  metric.status === 'Excellent' ? 'text-green-400 border-green-400' : 'text-blue-400 border-blue-400'
                }>
                  {metric.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Logs */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Audit Trail</CardTitle>
          <CardDescription className="text-slate-400">
            Comprehensive log of all agent interactions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="font-semibold text-white text-sm">{log.action}</div>
                        <div className="text-xs text-slate-400">{log.timestamp}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                      <Badge className={getProtocolColor(log.protocol)}>
                        {log.protocol}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-slate-400">Agent</div>
                      <div className="text-sm text-white">{log.agent}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Task ID</div>
                      <div className="text-sm text-white">{log.taskId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">User</div>
                      <div className="text-sm text-white">{log.user}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Trust Impact</div>
                      <div className={`text-sm font-semibold ${getTrustImpactColor(log.trustImpact)}`}>
                        {log.trustImpact}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 mb-1">Details</div>
                    <div className="text-sm text-slate-300">{log.details}</div>
                  </div>

                  <div className="flex justify-end mt-3">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditExplorer;
