
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Send, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface TaskData {
  protocol: string;
  task_type: string;
  input_data: { description: string };
  user_id: string;
}

const TaskRoutingDashboard = () => {
  const [taskInput, setTaskInput] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const queryClient = useQueryClient();

  // Fetch active agents
  const { data: agents } = useQuery({
    queryKey: ['active-agents'],
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

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: TaskData) => {
      const response = await supabase.functions.invoke('assign-agent-task', {
        body: taskData
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Task Created Successfully",
        description: `Task assigned to ${data.agent.name}`,
      });
      setTaskInput('');
      setSelectedProtocol('');
      setSelectedTaskType('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Task Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitTask = () => {
    if (!taskInput || !selectedProtocol || !selectedTaskType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      protocol: selectedProtocol,
      task_type: selectedTaskType,
      input_data: { description: taskInput },
      user_id: '00000000-0000-0000-0000-000000000000' // Placeholder for demo
    });
  };

  const protocolAgents = agents?.filter(agent => 
    selectedProtocol ? agent.protocol === selectedProtocol : true
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Input Panel */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Create New Task
          </CardTitle>
          <CardDescription className="text-slate-400">
            Submit a task for intelligent agent routing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="task-input" className="text-slate-300">
              Task Description
            </Label>
            <Textarea
              id="task-input"
              placeholder="Describe the task you want to delegate to an AI agent..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Protocol</Label>
              <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
                <SelectTrigger className="mt-2 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nlweb">NLWeb</SelectItem>
                  <SelectItem value="mcp">MCP</SelectItem>
                  <SelectItem value="a2a">A2A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Task Type</Label>
              <Select value={selectedTaskType} onValueChange={setSelectedTaskType}>
                <SelectTrigger className="mt-2 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nlp_processing">NLP Processing</SelectItem>
                  <SelectItem value="data_analysis">Data Analysis</SelectItem>
                  <SelectItem value="coordination">Coordination</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleSubmitTask}
            disabled={createTaskMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {createTaskMutation.isPending ? (
              "Creating Task..."
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Route Task
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Available Agents */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Available Agents</CardTitle>
          <CardDescription className="text-slate-400">
            {selectedProtocol ? 
              `Agents supporting ${selectedProtocol.toUpperCase()} protocol` : 
              'All active agents'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {protocolAgents?.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    agent.trust_score >= 90 ? 'bg-green-400' :
                    agent.trust_score >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <div className="text-white font-medium">{agent.name}</div>
                    <div className="text-slate-400 text-sm">
                      {agent.protocol.toUpperCase()} • Trust: {agent.trust_score}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    {agent.trust_score >= 90 ? 'Excellent' :
                     agent.trust_score >= 70 ? 'Good' : 'Needs Review'}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskRoutingDashboard;
