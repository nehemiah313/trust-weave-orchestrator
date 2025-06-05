
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const AgentConsole = () => {
  // Fetch agents data
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('trust_score', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent tasks
  const { data: recentTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['recent-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, agents(name, protocol)')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const getProtocolColor = (protocol: string) => {
    const colors = {
      nlweb: 'bg-blue-500',
      mcp: 'bg-purple-500',
      a2a: 'bg-green-500'
    };
    return colors[protocol as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-400',
      assigned: 'text-blue-400',
      in_progress: 'text-purple-400',
      completed: 'text-green-400',
      failed: 'text-red-400',
      cancelled: 'text-gray-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  if (agentsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents?.map((agent) => (
          <Card key={agent.id} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">{agent.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`${getProtocolColor(agent.protocol)} text-white border-0`}
                  >
                    {agent.protocol.toUpperCase()}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${agent.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              </div>
              <CardDescription className="text-slate-400">
                Trust Score: {agent.trust_score}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={agent.trust_score} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <div className={`font-medium ${agent.is_active ? 'text-green-400' : 'text-red-400'}`}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Last Active:</span>
                    <div className="text-white font-medium">
                      {agent.last_active ? 
                        new Date(agent.last_active).toLocaleDateString() : 
                        'Never'
                      }
                    </div>
                  </div>
                </div>

                {agent.capabilities && Object.keys(agent.capabilities).length > 0 && (
                  <div>
                    <span className="text-slate-400 text-sm">Capabilities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(agent.capabilities).map(([key, value]) => 
                        value && (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key.replace('_', ' ')}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tasks */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Tasks
          </CardTitle>
          <CardDescription className="text-slate-400">
            Latest task executions across all agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks?.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getProtocolColor(task.agents?.protocol || '')}`}>
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{task.agents?.name}</div>
                    <div className="text-slate-400 text-sm">{task.task_type.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {new Date(task.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  {task.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {task.status === 'failed' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                  {task.status === 'in_progress' && <Clock className="w-5 h-5 text-blue-400" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentConsole;
