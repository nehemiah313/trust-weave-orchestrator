
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Cpu, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const AgentConsole = () => {
  const [selectedAgent, setSelectedAgent] = useState('agent-001');

  const agents = [
    {
      id: 'agent-001',
      name: 'DataMiner Pro',
      protocol: 'NLWeb',
      trustScore: 96.8,
      status: 'active',
      activeTasks: 3,
      completedTasks: 127,
      revenue: 245.67,
      lastActivity: '2 minutes ago'
    },
    {
      id: 'agent-002',
      name: 'TextAnalyzer AI',
      protocol: 'MCP',
      trustScore: 94.2,
      status: 'active',
      activeTasks: 2,
      completedTasks: 89,
      revenue: 189.34,
      lastActivity: '5 minutes ago'
    },
    {
      id: 'agent-003',
      name: 'CodeGenerator Bot',
      protocol: 'A2A',
      trustScore: 91.5,
      status: 'idle',
      activeTasks: 0,
      completedTasks: 156,
      revenue: 298.12,
      lastActivity: '1 hour ago'
    },
    {
      id: 'agent-004',
      name: 'ImageProcessor X',
      protocol: 'NLWeb',
      trustScore: 98.1,
      status: 'active',
      activeTasks: 5,
      completedTasks: 203,
      revenue: 412.89,
      lastActivity: '1 minute ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 border-green-400';
      case 'idle': return 'text-yellow-400 border-yellow-400';
      case 'error': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'NLWeb': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'MCP': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'A2A': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const selectedAgentData = agents.find(agent => agent.id === selectedAgent);

  const recentLogs = [
    { time: '14:32:15', level: 'INFO', message: 'Task delegated to TextAnalyzer AI via MCP protocol', taskId: 'T-2024-001' },
    { time: '14:31:48', level: 'SUCCESS', message: 'Image processing completed successfully', taskId: 'T-2024-002' },
    { time: '14:30:22', level: 'WARNING', message: 'Trust score dropped below threshold for Agent-005', taskId: 'T-2024-003' },
    { time: '14:29:55', level: 'INFO', message: 'New agent registered: CodeReviewer Pro', taskId: 'T-2024-004' },
    { time: '14:28:11', level: 'ERROR', message: 'Connection timeout with external API', taskId: 'T-2024-005' }
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'ERROR': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Active Agents</CardTitle>
            <CardDescription className="text-slate-400">
              Manage and monitor your AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAgent === agent.id 
                        ? 'bg-slate-700/50 border-slate-600' 
                        : 'bg-slate-800/30 border-slate-700 hover:bg-slate-700/30'
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
                      <Badge variant="outline" className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getProtocolColor(agent.protocol)}>
                        {agent.protocol}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">{agent.trustScore}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {agent.activeTasks} active • {agent.completedTasks} completed
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Agent Details */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">
              {selectedAgentData?.name} Details
            </CardTitle>
            <CardDescription className="text-slate-400">
              Comprehensive agent performance and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAgentData && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-slate-400">Trust Score</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={selectedAgentData.trustScore} className="flex-1" />
                          <span className="text-sm font-semibold text-green-400">
                            {selectedAgentData.trustScore}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Protocol</label>
                        <div className="mt-1">
                          <Badge className={getProtocolColor(selectedAgentData.protocol)}>
                            {selectedAgentData.protocol}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-slate-400">Revenue Generated</label>
                        <div className="text-lg font-semibold text-white mt-1">
                          ${selectedAgentData.revenue.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Last Activity</label>
                        <div className="text-sm text-slate-300 mt-1">
                          {selectedAgentData.lastActivity}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-slate-300">Active Tasks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {selectedAgentData.activeTasks}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-slate-300">Completed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {selectedAgentData.completedTasks}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">Success Rate</label>
                      <Progress value={97.5} className="mt-1" />
                      <span className="text-xs text-slate-400">97.5% success rate</span>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Response Time</label>
                      <Progress value={85} className="mt-1" />
                      <span className="text-xs text-slate-400">1.2s avg response</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Logs */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity Logs</CardTitle>
          <CardDescription className="text-slate-400">
            Real-time system activity and agent interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {recentLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600">
                  {getLogIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{log.message}</span>
                      <span className="text-xs text-slate-400">{log.time}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Task ID: {log.taskId}</div>
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

export default AgentConsole;
