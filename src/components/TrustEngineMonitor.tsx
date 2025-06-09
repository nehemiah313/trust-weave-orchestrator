import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TrustEngineMetrics from './TrustEngineMetrics';

const TrustEngineMonitor = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [calculationResults, setCalculationResults] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch trust events
  const { data: trustEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['trust-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trust_events')
        .select('*, agents(name, protocol)')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch agents with trust scores
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents-trust'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('trust_score', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch 7d trust deltas
  const { data: trustDeltas } = useQuery({
    queryKey: ['trust-delta-7d'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data, error } = await supabase
        .from('trust_events')
        .select('agent_id, delta, created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      return data.reduce<Record<string, number>>((acc, event) => {
        if (!event.agent_id) return acc;
        acc[event.agent_id] = (acc[event.agent_id] || 0) + event.delta;
        return acc;
      }, {});
    },
  });

  const getEventIcon = (eventType: string, delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (delta < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  };

  const getEventColor = (eventType: string) => {
    const colors = {
      performance: 'border-blue-400 text-blue-400',
      error: 'border-red-400 text-red-400',
      security: 'border-purple-400 text-purple-400',
      compliance: 'border-green-400 text-green-400',
      timeout: 'border-yellow-400 text-yellow-400'
    };
    return colors[eventType as keyof typeof colors] || 'border-gray-400 text-gray-400';
  };

  const getTrustLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-400' };
    if (score >= 80) return { label: 'Good', color: 'text-blue-400' };
    if (score >= 60) return { label: 'Fair', color: 'text-yellow-400' };
    return { label: 'Needs Review', color: 'text-red-400' };
  };

  const calculateTrustScore = async (agentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-trust-score', {
        body: { agent_id: agentId }
      });

      if (error) throw error;
      
      setCalculationResults(data);
      setSelectedAgent(agentId);
      
      // Refetch data to show updated scores
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trust-events'] }),
        queryClient.invalidateQueries({ queryKey: ['agents-trust'] })
      ]);
    } catch (error) {
      console.error('Error calculating trust score:', error);
    }
  };

  if (eventsLoading || agentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // If an agent is selected and we have calculation results, show detailed metrics
  if (selectedAgent && calculationResults) {
    const agent = agents?.find(a => a.id === selectedAgent);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedAgent(null);
              setCalculationResults(null);
            }}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            ← Back to Overview
          </Button>
          <Button
            onClick={() => calculateTrustScore(selectedAgent)}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recalculate</span>
          </Button>
        </div>
        
        <TrustEngineMetrics
          metrics={calculationResults.metrics}
          adjustments={calculationResults.adjustments}
          agentName={agent?.name || 'Unknown Agent'}
          trustScore={calculationResults.trust_score}
        />
      </div>
    );
  }

  const averageTrustScore = agents?.length ? 
    agents.reduce((sum, agent) => sum + agent.trust_score, 0) / agents.length : 0;

  return (
    <div className="space-y-6">
      {/* Trust Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Average Trust Score</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{averageTrustScore.toFixed(1)}%</div>
            <Progress value={averageTrustScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">High Trust Agents</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {agents?.filter(a => a.trust_score >= 90).length || 0}
            </div>
            <p className="text-xs text-slate-400">
              Score ≥ 90%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Needs Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {agents?.filter(a => a.trust_score < 60).length || 0}
            </div>
            <p className="text-xs text-slate-400">
              Score &lt; 60%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Trust Rankings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Agent Trust Rankings</CardTitle>
            <CardDescription className="text-slate-400">
              Click on an agent to view detailed trust analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents?.map((agent, index) => {
                const trustLevel = getTrustLevel(agent.trust_score);
                return (
                  <div 
                    key={agent.id} 
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => calculateTrustScore(agent.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-slate-400 font-mono text-sm w-6">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">{agent.name}</div>
                        <div className="text-slate-400 text-sm">
                          {agent.protocol.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-white font-bold">{agent.trust_score}%</div>
                        <div className={`text-sm ${trustLevel.color}`}>{trustLevel.label}</div>
                        <div className="flex items-center justify-end space-x-1">
                          {(trustDeltas?.[agent.id] || 0) >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                          <span className={`font-mono text-xs ${
                            (trustDeltas?.[agent.id] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {(trustDeltas?.[agent.id] || 0) >= 0 ? '+' : ''}{(trustDeltas?.[agent.id] || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <Progress value={agent.trust_score} className="w-16" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trust Events */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Trust Events</CardTitle>
            <CardDescription className="text-slate-400">
              Latest trust score changes and trigger activations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trustEvents?.map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex-shrink-0">
                    {getEventIcon(event.event_type, event.delta)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">{event.agents?.name}</div>
                    <div className="text-slate-400 text-sm truncate">
                      {event.reason}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getEventColor(event.event_type)}>
                      {event.event_type}
                    </Badge>
                    <div className={`font-mono text-sm ${
                      event.delta > 0 ? 'text-green-400' : 
                      event.delta < 0 ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {event.delta > 0 ? '+' : ''}{event.delta.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrustEngineMonitor;
