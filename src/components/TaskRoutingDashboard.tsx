
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Cpu, Network, Shield, Clock, CheckCircle } from 'lucide-react';

const TaskRoutingDashboard = () => {
  const [taskInput, setTaskInput] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState('');
  const [routingStep, setRoutingStep] = useState(0);
  const [isRouting, setIsRouting] = useState(false);

  const protocols = [
    { value: 'nlweb', label: 'NLWeb', description: 'Natural Language Web Protocol' },
    { value: 'mcp', label: 'MCP', description: 'Multi-Agent Communication Protocol' },
    { value: 'a2a', label: 'A2A', description: 'Agent-to-Agent Direct Protocol' }
  ];

  const routingSteps = [
    { step: 1, title: 'Input Analysis', description: 'Parsing natural language intent' },
    { step: 2, title: 'Agent Selection', description: 'Identifying optimal agent based on trust scores' },
    { step: 3, title: 'Protocol Negotiation', description: 'Establishing communication channel' },
    { step: 4, title: 'Task Delegation', description: 'Transferring task with context' },
    { step: 5, title: 'Execution Monitoring', description: 'Real-time progress tracking' }
  ];

  const simulateRouting = async () => {
    if (!taskInput || !selectedProtocol) return;
    
    setIsRouting(true);
    setRoutingStep(0);
    
    for (let i = 0; i < routingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRoutingStep(i + 1);
    }
    
    setTimeout(() => {
      setIsRouting(false);
      setRoutingStep(0);
    }, 2000);
  };

  const activeRoutes = [
    {
      id: 'R-001',
      task: 'Analyze customer sentiment data',
      protocol: 'MCP',
      agent: 'TextAnalyzer AI',
      status: 'executing',
      progress: 75,
      trustScore: 94.2,
      estimatedTime: '2 min'
    },
    {
      id: 'R-002',
      task: 'Generate product documentation',
      protocol: 'A2A',
      agent: 'CodeGenerator Bot',
      status: 'delegating',
      progress: 25,
      trustScore: 91.5,
      estimatedTime: '8 min'
    },
    {
      id: 'R-003',
      task: 'Process image classification',
      protocol: 'NLWeb',
      agent: 'ImageProcessor X',
      status: 'completed',
      progress: 100,
      trustScore: 98.1,
      estimatedTime: 'Completed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executing': return 'text-blue-400 border-blue-400';
      case 'delegating': return 'text-yellow-400 border-yellow-400';
      case 'completed': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
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

  return (
    <div className="space-y-6">
      {/* Task Input and Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Task Input Simulator</CardTitle>
            <CardDescription className="text-slate-400">
              Test natural language task routing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Task Description</label>
              <Textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Describe the task you want to delegate..."
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Preferred Protocol</label>
              <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select protocol..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {protocols.map((protocol) => (
                    <SelectItem key={protocol.value} value={protocol.value} className="text-white">
                      <div>
                        <div className="font-medium">{protocol.label}</div>
                        <div className="text-xs text-slate-400">{protocol.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={simulateRouting}
              disabled={!taskInput || !selectedProtocol || isRouting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isRouting ? 'Routing...' : 'Simulate Task Routing'}
            </Button>
          </CardContent>
        </Card>

        {/* Routing Progress */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Routing Process</CardTitle>
            <CardDescription className="text-slate-400">
              Multi-protocol orchestration flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routingSteps.map((step, index) => (
                <div key={step.step} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    routingStep > index ? 'bg-green-500 border-green-500' :
                    routingStep === index + 1 ? 'bg-blue-500 border-blue-500 animate-pulse' :
                    'border-slate-600'
                  }`}>
                    {routingStep > index ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs text-white font-semibold">{step.step}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{step.title}</div>
                    <div className="text-xs text-slate-400">{step.description}</div>
                  </div>
                  {index < routingSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Routes */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Active Task Routes</CardTitle>
          <CardDescription className="text-slate-400">
            Real-time task delegation and execution status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeRoutes.map((route) => (
              <div key={route.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-white">{route.task}</span>
                      <Badge variant="outline" className={getStatusColor(route.status)}>
                        {route.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span>ID: {route.id}</span>
                      <span>Agent: {route.agent}</span>
                      <span>ETA: {route.estimatedTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getProtocolColor(route.protocol)}>
                      {route.protocol}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">{route.trustScore}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white">{route.progress}%</span>
                  </div>
                  <Progress value={route.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protocol Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {protocols.map((protocol) => (
          <Card key={protocol.value} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Network className="w-5 h-5" />
                <span>{protocol.label}</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                {protocol.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Active Routes</span>
                  <span className="text-sm font-semibold text-white">
                    {protocol.value === 'mcp' ? '2' : protocol.value === 'a2a' ? '1' : '3'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Success Rate</span>
                  <span className="text-sm font-semibold text-green-400">
                    {protocol.value === 'mcp' ? '94.2%' : protocol.value === 'a2a' ? '91.5%' : '98.1%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Avg Response Time</span>
                  <span className="text-sm font-semibold text-white">
                    {protocol.value === 'mcp' ? '1.8s' : protocol.value === 'a2a' ? '2.1s' : '1.2s'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskRoutingDashboard;
