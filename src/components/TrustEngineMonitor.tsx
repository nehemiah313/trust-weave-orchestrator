
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

const TrustEngineMonitor = () => {
  const [selectedAgent, setSelectedAgent] = useState('all');

  const trustData = [
    { time: '00:00', agent1: 96.8, agent2: 94.2, agent3: 91.5, agent4: 98.1 },
    { time: '04:00', agent1: 97.1, agent2: 93.8, agent3: 92.1, agent4: 97.9 },
    { time: '08:00', agent1: 96.5, agent2: 94.5, agent3: 91.8, agent4: 98.3 },
    { time: '12:00', agent1: 97.2, agent2: 94.1, agent3: 90.9, agent4: 98.0 },
    { time: '16:00', agent1: 96.9, agent2: 94.7, agent3: 92.3, agent4: 98.2 },
    { time: '20:00', agent1: 96.8, agent2: 94.2, agent3: 91.5, agent4: 98.1 }
  ];

  const trustFactors = [
    { factor: 'Task Success Rate', weight: 40, current: 97.5, target: 95.0 },
    { factor: 'Response Time', weight: 25, current: 92.0, target: 90.0 },
    { factor: 'Resource Efficiency', weight: 20, current: 88.5, target: 85.0 },
    { factor: 'Error Recovery', weight: 15, current: 94.0, target: 90.0 }
  ];

  const agentTrustScores = [
    {
      id: 'agent-001',
      name: 'DataMiner Pro',
      trustScore: 96.8,
      trend: 'up',
      change: +0.3,
      status: 'excellent',
      violations: 0,
      lastUpdate: '2 min ago'
    },
    {
      id: 'agent-002',
      name: 'TextAnalyzer AI',
      trustScore: 94.2,
      trend: 'up',
      change: +0.1,
      status: 'good',
      violations: 1,
      lastUpdate: '5 min ago'
    },
    {
      id: 'agent-003',
      name: 'CodeGenerator Bot',
      trustScore: 91.5,
      trend: 'down',
      change: -0.6,
      status: 'warning',
      violations: 3,
      lastUpdate: '1 hour ago'
    },
    {
      id: 'agent-004',
      name: 'ImageProcessor X',
      trustScore: 98.1,
      trend: 'up',
      change: +0.2,
      status: 'excellent',
      violations: 0,
      lastUpdate: '1 min ago'
    }
  ];

  const trustEvents = [
    {
      time: '14:32:15',
      agent: 'CodeGenerator Bot',
      event: 'Trust score dropped below 92%',
      severity: 'warning',
      reason: 'Increased response time detected'
    },
    {
      time: '14:15:22',
      agent: 'ImageProcessor X',
      event: 'Trust score increased to 98.1%',
      severity: 'info',
      reason: 'Consistently high performance'
    },
    {
      time: '13:45:18',
      agent: 'TextAnalyzer AI',
      event: 'Trust violation detected',
      severity: 'error',
      reason: 'Task failure rate exceeded threshold'
    },
    {
      time: '13:22:05',
      agent: 'DataMiner Pro',
      event: 'Trust score stabilized',
      severity: 'success',
      reason: 'Performance metrics normalized'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 border-green-400';
      case 'good': return 'text-blue-400 border-blue-400';
      case 'warning': return 'text-yellow-400 border-yellow-400';
      case 'critical': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Shield className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Trust Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {agentTrustScores.map((agent) => (
          <Card key={agent.id} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white">{agent.name}</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Updated {agent.lastUpdate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-white">
                    {agent.trustScore}%
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(agent.trend, agent.change)}
                    <span className={`text-xs ${agent.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {agent.trend === 'up' ? '+' : ''}{agent.change}%
                    </span>
                  </div>
                </div>
                <Progress value={agent.trustScore} className="h-2" />
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {agent.violations} violations
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trust Score Trends */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Trust Score Trends</CardTitle>
            <CardDescription className="text-slate-400">
              24-hour agent performance tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trustData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis domain={[85, 100]} stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563', 
                    borderRadius: '8px' 
                  }} 
                />
                <Line type="monotone" dataKey="agent1" stroke="#60A5FA" name="DataMiner Pro" />
                <Line type="monotone" dataKey="agent2" stroke="#A78BFA" name="TextAnalyzer AI" />
                <Line type="monotone" dataKey="agent3" stroke="#34D399" name="CodeGenerator Bot" />
                <Line type="monotone" dataKey="agent4" stroke="#FBBF24" name="ImageProcessor X" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trust Factors */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Trust Factor Analysis</CardTitle>
            <CardDescription className="text-slate-400">
              Weighted performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trustFactors.map((factor) => (
                <div key={factor.factor} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{factor.factor}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Weight: {factor.weight}%</span>
                      <span className="text-sm font-semibold text-white">{factor.current}%</span>
                    </div>
                  </div>
                  <Progress value={factor.current} className="h-2" />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Target: {factor.target}%</span>
                    <span className={factor.current >= factor.target ? 'text-green-400' : 'text-yellow-400'}>
                      {factor.current >= factor.target ? 'Above target' : 'Below target'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Events */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Trust Events</CardTitle>
          <CardDescription className="text-slate-400">
            Recent trust score changes and violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trustEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600">
                {getSeverityIcon(event.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{event.event}</span>
                    <span className="text-xs text-slate-400">{event.time}</span>
                  </div>
                  <div className="text-sm text-slate-300 mt-1">{event.agent}</div>
                  <div className="text-xs text-slate-400 mt-1">{event.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustEngineMonitor;
