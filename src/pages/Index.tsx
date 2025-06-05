
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import AgentConsole from '@/components/AgentConsole';
import TaskRoutingDashboard from '@/components/TaskRoutingDashboard';
import AuditExplorer from '@/components/AuditExplorer';
import TrustEngineMonitor from '@/components/TrustEngineMonitor';
import BillingOverview from '@/components/BillingOverview';
import DemoScenarios from '@/components/DemoScenarios';
import { Shield, Cpu, Network, DollarSign, FileText, Play } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('console');

  const systemStats = {
    activeAgents: 12,
    totalTasks: 1847,
    trustScore: 94.2,
    revenue: 2456.78
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                TrustWeave Orchestrator
              </h1>
              <p className="text-slate-300 text-lg">
                AI Agent Coordination & Trust Management Platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                System Online
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                v1.0.0
              </Badge>
            </div>
          </div>

          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Active Agents</CardTitle>
                <Cpu className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{systemStats.activeAgents}</div>
                <p className="text-xs text-slate-400">
                  +2 from last hour
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Tasks</CardTitle>
                <Network className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{systemStats.totalTasks.toLocaleString()}</div>
                <p className="text-xs text-slate-400">
                  +127 today
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Trust Score</CardTitle>
                <Shield className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{systemStats.trustScore}%</div>
                <Progress value={systemStats.trustScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${systemStats.revenue.toFixed(2)}</div>
                <p className="text-xs text-slate-400">
                  +12.5% this month
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="console" className="data-[state=active]:bg-slate-700">
              <Cpu className="w-4 h-4 mr-2" />
              Agent Console
            </TabsTrigger>
            <TabsTrigger value="routing" className="data-[state=active]:bg-slate-700">
              <Network className="w-4 h-4 mr-2" />
              Task Routing
            </TabsTrigger>
            <TabsTrigger value="trust" className="data-[state=active]:bg-slate-700">
              <Shield className="w-4 h-4 mr-2" />
              Trust Engine
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              Audit Explorer
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-slate-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="demos" className="data-[state=active]:bg-slate-700">
              <Play className="w-4 h-4 mr-2" />
              Demo Scenarios
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="console" className="space-y-6">
              <AgentConsole />
            </TabsContent>

            <TabsContent value="routing" className="space-y-6">
              <TaskRoutingDashboard />
            </TabsContent>

            <TabsContent value="trust" className="space-y-6">
              <TrustEngineMonitor />
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <AuditExplorer />
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <BillingOverview />
            </TabsContent>

            <TabsContent value="demos" className="space-y-6">
              <DemoScenarios />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
