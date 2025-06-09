
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Brain, 
  TrendingDown, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const DemoScenarios = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [scenarioProgress, setScenarioProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [demoResults, setDemoResults] = useState<any>(null);
  const queryClient = useQueryClient();

  // Demo user ID for scenarios
  const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

  // Fetch agents for demo
  const { data: agents } = useQuery({
    queryKey: ['demo-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('is_active', true)
        .order('trust_score', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Intent-to-Agent Orchestration Demo
  const runOrchestrationDemo = useMutation({
    mutationFn: async () => {
      const steps = [
        { step: 1, description: 'Parsing natural language input...', delay: 1000 },
        { step: 2, description: 'Analyzing task requirements...', delay: 1500 },
        { step: 3, description: 'Selecting best agent based on trust score...', delay: 1000 },
        { step: 4, description: 'Assigning task to agent...', delay: 2000 },
        { step: 5, description: 'Task execution complete!', delay: 1000 }
      ];

      const results = [];
      
      for (const { step, description, delay } of steps) {
        setScenarioProgress((step / steps.length) * 100);
        
        if (step === 3) {
          // Select protocol based on input analysis
          const protocol = naturalLanguageInput.toLowerCase().includes('web') ? 'nlweb' : 
                          naturalLanguageInput.toLowerCase().includes('data') ? 'mcp' : 'a2a';
          
          const selectedAgent = agents?.find(agent => agent.protocol === protocol) || agents?.[0];
          results.push({ type: 'agent_selection', data: { protocol, agent: selectedAgent } });
        }
        
        if (step === 4) {
          // Create actual task
          const response = await supabase.functions.invoke('assign-agent-task', {
            body: {
              protocol: 'nlweb',
              task_type: 'nlp_processing',
              input_data: { description: naturalLanguageInput },
              user_id: DEMO_USER_ID
            }
          });
          
          if (response.data) {
            results.push({ type: 'task_created', data: response.data });
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return results;
    },
    onSuccess: (results) => {
      setDemoResults({ scenario: 'orchestration', data: results });
      toast({
        title: "Orchestration Demo Complete",
        description: "Natural language input successfully processed and assigned to agent",
      });
    },
  });

  // Trust Drift Simulation Demo
  const runTrustDriftDemo = useMutation({
    mutationFn: async () => {
      const targetAgent = agents?.[0];
      if (!targetAgent) throw new Error('No agents available');

      const results = [];
      let currentTrustScore = targetAgent.trust_score;
      
      for (let i = 1; i <= 10; i++) {
        setScenarioProgress((i / 10) * 100);
        
        // Create task with simulated delay
        const taskResponse = await supabase.functions.invoke('assign-agent-task', {
          body: {
            protocol: targetAgent.protocol,
            task_type: 'data_analysis',
            input_data: { description: `Demo task ${i} with simulated delay` },
            user_id: DEMO_USER_ID
          }
        });

        // Simulate task completion with increasing delay
        await new Promise(resolve => setTimeout(resolve, 500 + (i * 200)));
        
        // Calculate trust score with penalty for delays
        const trustResponse = await supabase.functions.invoke('calculate-trust-score', {
          body: { agent_id: targetAgent.id }
        });

        if (trustResponse.data) {
          currentTrustScore = trustResponse.data.trust_score;
          results.push({
            task: i,
            trust_score: currentTrustScore,
            delta: trustResponse.data.delta,
            reason: trustResponse.data.reason
          });
        }

        // If trust drops below 70, trigger reassignment
        if (currentTrustScore < 70 && i >= 5) {
          const backupAgent = agents?.find(agent => agent.id !== targetAgent.id && agent.trust_score > 80);
          if (backupAgent) {
            results.push({
              type: 'reassignment',
              from_agent: targetAgent.name,
              to_agent: backupAgent.name,
              reason: 'Trust score dropped below threshold'
            });
            break;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      return results;
    },
    onSuccess: (results) => {
      setDemoResults({ scenario: 'trust_drift', data: results });
      toast({
        title: "Trust Drift Demo Complete",
        description: "Simulated trust degradation and agent reassignment",
      });
    },
  });

  // Billing + Logging Demo
  const runBillingDemo = useMutation({
    mutationFn: async () => {
      const results = { tasks: [], billing_events: [], audit_logs: [] };
      
      for (let i = 1; i <= 5; i++) {
        setScenarioProgress((i / 5) * 100);
        
        // Create task
        const taskResponse = await supabase.functions.invoke('assign-agent-task', {
          body: {
            protocol: 'mcp',
            task_type: 'verification',
            input_data: { description: `Billing demo task ${i}` },
            user_id: DEMO_USER_ID
          }
        });

        if (taskResponse.data) {
          results.tasks.push(taskResponse.data);
          
          // Generate billing events
          const billingResponse = await supabase.functions.invoke('charge-usage', {
            body: {
              task_id: taskResponse.data.task_id,
              fee_types: ['per_task', 'compliance', 'verification']
            }
          });

          if (billingResponse.data) {
            results.billing_events.push(billingResponse.data);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Fetch audit logs for demo user
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', DEMO_USER_ID)
        .order('timestamp', { ascending: false })
        .limit(10);

      results.audit_logs = auditLogs || [];
      
      return results;
    },
    onSuccess: (results) => {
      setDemoResults({ scenario: 'billing', data: results });
      toast({
        title: "Billing & Logging Demo Complete",
        description: "Generated billing events and audit trail for 5 tasks",
      });
    },
  });

  const runScenario = (scenario: string) => {
    setSelectedScenario(scenario);
    setIsRunning(true);
    setScenarioProgress(0);
    setDemoResults(null);

    switch (scenario) {
      case 'orchestration':
        if (!naturalLanguageInput.trim()) {
          toast({
            title: "Input Required",
            description: "Please enter a natural language task description",
            variant: "destructive",
          });
          setIsRunning(false);
          return;
        }
        runOrchestrationDemo.mutate();
        break;
      case 'trust_drift':
        runTrustDriftDemo.mutate();
        break;
      case 'billing':
        runBillingDemo.mutate();
        break;
    }
  };

  const resetDemo = () => {
    setSelectedScenario(null);
    setIsRunning(false);
    setScenarioProgress(0);
    setDemoResults(null);
    setNaturalLanguageInput('');
  };

  return (
    <div className="space-y-6">
      {/* Demo Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intent-to-Agent Orchestration */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <span>Intent-to-Agent Orchestration</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Natural language input → agent selection → task execution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter a natural language task (e.g., 'Analyze web traffic data and generate insights')"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
              rows={3}
            />
            <Button
              onClick={() => runScenario('orchestration')}
              disabled={isRunning || !naturalLanguageInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Orchestration Demo
            </Button>
          </CardContent>
        </Card>

        {/* Trust Drift Simulation */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-red-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <span>Trust Drift Simulation</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              10 tasks with delays → trust drops → agent reassignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-slate-300 space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span>Simulates increasing task delays</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>Trust score degradation</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4 text-blue-400" />
                <span>Automatic agent reassignment</span>
              </div>
            </div>
            <Button
              onClick={() => runScenario('trust_drift')}
              disabled={isRunning}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Run Trust Drift Demo
            </Button>
          </CardContent>
        </Card>

        {/* Billing + Logging */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span>Billing + Logging</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              5 tasks → fee calculation → audit trail → billing summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-slate-300 space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-purple-400" />
                <span>Multiple fee types</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Complete audit trail</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-yellow-400" />
                <span>Billing event summary</span>
              </div>
            </div>
            <Button
              onClick={() => runScenario('billing')}
              disabled={isRunning}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Run Billing Demo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicator */}
      {isRunning && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Demo Progress</span>
              <Button
                variant="outline"
                size="sm"
                onClick={resetDemo}
                className="text-slate-300 border-slate-600"
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={scenarioProgress} className="mb-2" />
            <div className="text-sm text-slate-400">
              Running {selectedScenario?.replace('_', ' ')} demo... {Math.round(scenarioProgress)}%
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Results */}
      {demoResults && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Demo Results</span>
              <Button
                variant="outline"
                size="sm"
                onClick={resetDemo}
                className="text-slate-300 border-slate-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoResults.scenario === 'orchestration' && (
                <div className="space-y-3">
                  {demoResults.data.map((result: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                      {result.type === 'agent_selection' && (
                        <div>
                          <Badge className="mb-2 bg-blue-600">Agent Selected</Badge>
                          <div className="text-white">
                            <strong>{result.data.agent?.name}</strong> ({result.data.protocol.toUpperCase()})
                          </div>
                          <div className="text-slate-400 text-sm">
                            Trust Score: {result.data.agent?.trust_score}%
                          </div>
                        </div>
                      )}
                      {result.type === 'task_created' && (
                        <div>
                          <Badge className="mb-2 bg-green-600">Task Created</Badge>
                          <div className="text-white">Task ID: {result.data.task_id}</div>
                          <div className="text-slate-400 text-sm">
                            Assigned to: {result.data.agent.name}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {demoResults.scenario === 'trust_drift' && (
                <div className="space-y-3">
                  {demoResults.data.map((result: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                      {result.type === 'reassignment' ? (
                        <div>
                          <Badge className="mb-2 bg-red-600">Agent Reassigned</Badge>
                          <div className="text-white">
                            {result.from_agent} → {result.to_agent}
                          </div>
                          <div className="text-slate-400 text-sm">{result.reason}</div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-white">Task {result.task}</span>
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm ${
                              result.delta > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {result.delta > 0 ? '+' : ''}{result.delta?.toFixed(1)}
                            </span>
                            <span className="text-white font-mono">
                              {result.trust_score?.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {demoResults.scenario === 'billing' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Tasks Created</h4>
                    <div className="text-slate-300">
                      {demoResults.data.tasks.length} tasks completed
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2">Billing Summary</h4>
                    <div className="space-y-2">
                      {demoResults.data.billing_events.map((billing: any, index: number) => (
                        <div key={index} className="flex justify-between p-2 bg-slate-700/30 rounded">
                          <span className="text-slate-300">Task {index + 1}</span>
                          <span className="text-green-400 font-mono">
                            ${billing.total_amount?.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-slate-600">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-green-400 font-semibold">
                          ${demoResults.data.billing_events.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Audit Trail</h4>
                    <div className="text-slate-300">
                      {demoResults.data.audit_logs.length} audit entries recorded
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isRunning && !demoResults && (
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">Demo Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-300 space-y-2">
              <p><strong>Intent-to-Agent Orchestration:</strong> Enter a natural language task description to see how the system analyzes, selects the best agent, and executes the task.</p>
              <p><strong>Trust Drift Simulation:</strong> Watch as simulated task delays cause trust scores to drop and trigger automatic agent reassignment.</p>
              <p><strong>Billing + Logging:</strong> See complete billing calculations and audit trail generation for multiple tasks.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DemoScenarios;
